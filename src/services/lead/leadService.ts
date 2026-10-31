import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { Lead, OutreachLog } from "@/db/schema";
import { calculateLeadScore } from "./scoring";
import { enrichDomainZeroKey } from "./osintService";

export interface DecisionMakerItem {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface LeadWithDetails extends Lead {
  parsedTechStack: string[];
  parsedSecurityIssues: Array<{ type: string; severity: string; detail: string }>;
  parsedScoreBreakdown: Record<string, number>;
  parsedDecisionMakers: DecisionMakerItem[];
  outreachHistory?: OutreachLog[];
}

export const LEAD_STAGES = [
  { value: "discovered", label: "Discovered", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { value: "enriched", label: "Enriched", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "contacted", label: "Contacted", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "qualified", label: "Qualified", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "converted", label: "Converted", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "rejected", label: "Rejected", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
] as const;

export async function fetchLeads(): Promise<LeadWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    "SELECT * FROM leads ORDER BY lead_score DESC, updated_at DESC"
  );

  return rows.map((l) => ({
    ...l,
    parsedTechStack: safeJson<string[]>(l.techStack, []),
    parsedSecurityIssues: safeJson<any[]>(l.securityIssues, []),
    parsedScoreBreakdown: safeJson<Record<string, number>>(l.scoreBreakdown, {}),
    parsedDecisionMakers: safeJson<DecisionMakerItem[]>(l.decisionMakers || l.decision_makers, []),
  }));
}

export async function fetchLeadById(id: string): Promise<LeadWithDetails | null> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    "SELECT * FROM leads WHERE id = $1 LIMIT 1",
    [id]
  );
  if (!rows || rows.length === 0) return null;

  const l = rows[0];
  const logs = await db.select<OutreachLog[]>(
    "SELECT * FROM outreach_log WHERE lead_id = $1 ORDER BY date DESC",
    [id]
  );

  return {
    ...l,
    parsedTechStack: safeJson<string[]>(l.techStack, []),
    parsedSecurityIssues: safeJson<any[]>(l.securityIssues, []),
    parsedScoreBreakdown: safeJson<Record<string, number>>(l.scoreBreakdown, {}),
    parsedDecisionMakers: safeJson<DecisionMakerItem[]>(l.decisionMakers || l.decision_makers, []),
    outreachHistory: logs,
  };
}

export interface UpsertLeadInput {
  id?: string;
  companyName: string;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  companySize?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  decisionMaker?: string | null;
  decisionMakerRole?: string | null;
  decisionMakersList?: DecisionMakerItem[];
  techStack?: string[];
  securityIssues?: Array<{ type: string; severity: string; detail: string }>;
  stage?: string;
  source?: string | null;
  notes?: string | null;
}

export async function saveLead(input: UpsertLeadInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();

  // Run auto scoring
  const scoreResult = calculateLeadScore({
    website: input.website,
    companySize: input.companySize,
    techStack: input.techStack,
    securityIssues: input.securityIssues,
    hasEmail: Boolean(input.email),
    hasPhone: Boolean(input.phone),
    hasDecisionMaker: Boolean(input.decisionMaker),
    hasLinkedin: Boolean(input.linkedin),
  });

  const techJson = JSON.stringify(input.techStack || []);
  const secJson = JSON.stringify(input.securityIssues || []);
  const breakdownJson = JSON.stringify(scoreResult.breakdown);
  const decisionMakersJson = JSON.stringify(input.decisionMakersList || []);

  const firstDm = input.decisionMakersList?.[0];
  const dmName = input.decisionMaker || firstDm?.name || null;
  const dmRole = input.decisionMakerRole || firstDm?.role || null;
  const leadEmail = input.email || firstDm?.email || null;
  const leadPhone = input.phone || firstDm?.phone || null;

  if (input.id) {
    await db.execute(
      `UPDATE leads SET
        company_name = $1, website = $2, industry = $3, country = $4,
        city = $5, company_size = $6, email = $7, phone = $8,
        linkedin = $9, decision_maker = $10, decision_maker_role = $11,
        decision_makers = $12, tech_stack = $13, security_issues = $14, lead_score = $15,
        score_breakdown = $16, stage = $17, source = $18, notes = $19,
        updated_at = $20
       WHERE id = $21`,
      [
        input.companyName,
        input.website || null,
        input.industry || null,
        input.country || null,
        input.city || null,
        input.companySize || "1-10",
        leadEmail,
        leadPhone,
        input.linkedin || null,
        dmName,
        dmRole,
        decisionMakersJson,
        techJson,
        secJson,
        scoreResult.score,
        breakdownJson,
        input.stage || "discovered",
        input.source || null,
        input.notes || null,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO leads (
        id, company_name, website, industry, country, city, company_size,
        email, phone, linkedin, decision_maker, decision_maker_role,
        decision_makers, tech_stack, security_issues, lead_score, score_breakdown,
        stage, source, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        newId,
        input.companyName,
        input.website || null,
        input.industry || null,
        input.country || null,
        input.city || null,
        input.companySize || "1-10",
        leadEmail,
        leadPhone,
        input.linkedin || null,
        dmName,
        dmRole,
        decisionMakersJson,
        techJson,
        secJson,
        scoreResult.score,
        breakdownJson,
        input.stage || "discovered",
        input.source || null,
        input.notes || null,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function enrichLeadRecord(leadId: string): Promise<void> {
  const lead = await fetchLeadById(leadId);
  if (!lead || !lead.website) return;

  const enrichment = await enrichDomainZeroKey(lead.website);

  const mergedTech = Array.from(new Set([...lead.parsedTechStack, ...enrichment.techStack]));
  const mergedIssues = [...lead.parsedSecurityIssues, ...enrichment.securityIssues];

  const scoreResult = calculateLeadScore({
    website: lead.website,
    companySize: lead.companySize,
    techStack: mergedTech,
    securityIssues: mergedIssues,
    whoisData: enrichment.whoisData,
    hasEmail: Boolean(lead.email),
    hasPhone: Boolean(lead.phone),
    hasDecisionMaker: Boolean(lead.decisionMaker),
    hasLinkedin: Boolean(lead.linkedin),
  });

  const db = await getDatabase();
  await db.execute(
    `UPDATE leads SET
      tech_stack = $1, security_issues = $2, whois_data = $3,
      lead_score = $4, score_breakdown = $5, stage = 'enriched',
      updated_at = $6
     WHERE id = $7`,
    [
      JSON.stringify(mergedTech),
      JSON.stringify(mergedIssues),
      JSON.stringify(enrichment.whoisData),
      scoreResult.score,
      JSON.stringify(scoreResult.breakdown),
      nowUnix(),
      leadId,
    ]
  );
}

export async function convertLeadToClient(leadId: string): Promise<string> {
  const lead = await fetchLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const db = await getDatabase();
  const clientId = generateId();
  const now = nowUnix();

  // Create client record
  await db.execute(
    `INSERT INTO clients (
      id, name, company, company_size, industry, country, city,
      email, phone, website, linkedin, status, lead_score, notes,
      source, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', $12, $13, $14, $15, $16)`,
    [
      clientId,
      lead.decisionMaker || lead.companyName,
      lead.companyName,
      lead.companySize,
      lead.industry,
      lead.country,
      lead.city,
      lead.email,
      lead.phone,
      lead.website,
      lead.linkedin,
      lead.leadScore,
      `Converted from Lead Funnel. Notes: ${lead.notes || "None"}`,
      `Lead Funnel (${lead.source || "OSINT"})`,
      now,
      now,
    ]
  );

  // Link lead to newly created client
  await db.execute(
    "UPDATE leads SET stage = 'converted', converted_client_id = $1, updated_at = $2 WHERE id = $3",
    [clientId, now, leadId]
  );

  return clientId;
}

export async function logOutreachAttempt(
  leadId: string,
  type: "email" | "call" | "meeting" | "note",
  subject: string,
  content: string
): Promise<void> {
  const db = await getDatabase();
  const now = nowUnix();
  const logId = generateId();

  await db.execute(
    "INSERT INTO outreach_log (id, lead_id, type, subject, content, date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [logId, leadId, type, subject, content, now, now]
  );

  await db.execute(
    "UPDATE leads SET stage = 'contacted', outreach_status = $1, outreach_date = $2, updated_at = $3 WHERE id = $4",
    [type, now, now, leadId]
  );
}

export async function updateLeadStage(leadId: string, stage: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("UPDATE leads SET stage = $1, updated_at = $2 WHERE id = $3", [
    stage,
    nowUnix(),
    leadId,
  ]);
}

export async function deleteLead(leadId: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM leads WHERE id = $1", [leadId]);
}
