import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { AuditSession } from "@/db/schema";
import type { Finding } from "./pdf/auditPdf";
import type { AuditChecklistItem } from "@/lib/auditTemplates";

export interface AuditSessionWithDetails extends AuditSession {
  clientName?: string;
  clientCompany?: string;
  projectName?: string;
  parsedFindings: Finding[];
  parsedChecklist: Record<string, AuditChecklistItem[]>;
}

export async function fetchAuditSessions(): Promise<AuditSessionWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT a.*, c.name as client_name, c.company as client_company, p.name as project_name
     FROM audit_sessions a
     LEFT JOIN clients c ON a.client_id = c.id
     LEFT JOIN projects p ON a.project_id = p.id
     ORDER BY a.started_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    projectId: r.project_id,
    title: r.title,
    level: r.level,
    status: r.status,
    findings: r.findings,
    checklist: r.checklist,
    scope: r.scope,
    notes: r.notes,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
    projectName: r.project_name,
    parsedFindings: safeJson<Finding[]>(r.findings, []),
    parsedChecklist: safeJson<Record<string, AuditChecklistItem[]>>(r.checklist, {}),
  }));
}

export interface UpsertAuditInput {
  id?: string;
  clientId?: string | null;
  projectId?: string | null;
  title: string;
  level: string;
  status: string;
  scope?: string | null;
  notes?: string | null;
  findings?: Finding[];
  checklist?: Record<string, AuditChecklistItem[]>;
}

export async function saveAuditSession(input: UpsertAuditInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const findingsJson = JSON.stringify(input.findings || []);
  const checklistJson = JSON.stringify(input.checklist || {});
  const completedAt = input.status === "completed" ? now : null;

  if (input.id) {
    await db.execute(
      `UPDATE audit_sessions SET
        client_id = $1, project_id = $2, title = $3, level = $4,
        status = $5, scope = $6, notes = $7, findings = $8,
        checklist = $9, completed_at = $10, updated_at = $11
       WHERE id = $12`,
      [
        input.clientId || null,
        input.projectId || null,
        input.title,
        input.level,
        input.status,
        input.scope || null,
        input.notes || null,
        findingsJson,
        checklistJson,
        completedAt,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO audit_sessions (
        id, client_id, project_id, title, level, status,
        scope, notes, findings, checklist, started_at, completed_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        newId,
        input.clientId || null,
        input.projectId || null,
        input.title,
        input.level,
        input.status,
        input.scope || null,
        input.notes || null,
        findingsJson,
        checklistJson,
        now,
        completedAt,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function deleteAuditSession(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM audit_sessions WHERE id = $1", [id]);
}
