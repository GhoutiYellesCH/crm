import { getDatabase } from "@/db/client";
import { generateId, nowUnix, safeJson } from "@/lib/utils";
import type { Project, Task, User } from "@/db/schema";
import type { ChecklistItem } from "@/lib/projectTemplates";

export interface ProjectWithDetails extends Project {
  clientName?: string;
  clientCompany?: string;
  tasks?: Task[];
  parsedChecklist: ChecklistItem[];
}

export interface TaskWithDetails extends Task {
  clientName?: string;
  projectName?: string;
  assigneeName?: string;
  parsedTags: string[];
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<ProjectWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT p.*, c.name as client_name, c.company as client_company
     FROM projects p
     LEFT JOIN clients c ON p.client_id = c.id
     ORDER BY p.updated_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    description: r.description,
    status: r.status,
    serviceType: r.service_type,
    checklist: r.checklist,
    startDate: r.start_date,
    dueDate: r.due_date,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
    parsedChecklist: safeJson<ChecklistItem[]>(r.checklist, []),
  }));
}

export async function fetchProjectById(id: string): Promise<ProjectWithDetails | null> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT p.*, c.name as client_name, c.company as client_company
     FROM projects p
     LEFT JOIN clients c ON p.client_id = c.id
     WHERE p.id = $1 LIMIT 1`,
    [id]
  );
  if (!rows || rows.length === 0) return null;

  const r = rows[0];
  const tasks = await db.select<Task[]>(
    "SELECT * FROM tasks WHERE project_id = $1 ORDER BY position ASC, created_at DESC",
    [id]
  );

  return {
    id: r.id,
    clientId: r.client_id,
    name: r.name,
    description: r.description,
    status: r.status,
    serviceType: r.service_type,
    checklist: r.checklist,
    startDate: r.start_date,
    dueDate: r.due_date,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
    tasks,
    parsedChecklist: safeJson<ChecklistItem[]>(r.checklist, []),
  };
}

export interface UpsertProjectInput {
  id?: string;
  clientId?: string | null;
  name: string;
  description?: string | null;
  status: string;
  serviceType: string;
  checklist?: ChecklistItem[];
  startDate?: number | null;
  dueDate?: number | null;
}

export async function saveProject(input: UpsertProjectInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const checklistJson = JSON.stringify(input.checklist || []);

  if (input.id) {
    await db.execute(
      `UPDATE projects SET
        client_id = $1, name = $2, description = $3, status = $4,
        service_type = $5, checklist = $6, start_date = $7, due_date = $8,
        updated_at = $9
       WHERE id = $10`,
      [
        input.clientId || null,
        input.name,
        input.description || null,
        input.status,
        input.serviceType,
        checklistJson,
        input.startDate || null,
        input.dueDate || null,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO projects (
        id, client_id, name, description, status, service_type,
        checklist, start_date, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        newId,
        input.clientId || null,
        input.name,
        input.description || null,
        input.status,
        input.serviceType,
        checklistJson,
        input.startDate || null,
        input.dueDate || null,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM projects WHERE id = $1", [id]);
}

export async function toggleProjectChecklistItem(
  projectId: string,
  itemId: string
): Promise<void> {
  const proj = await fetchProjectById(projectId);
  if (!proj) return;

  const updatedChecklist = proj.parsedChecklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  );

  const db = await getDatabase();
  await db.execute(
    "UPDATE projects SET checklist = $1, updated_at = $2 WHERE id = $3",
    [JSON.stringify(updatedChecklist), nowUnix(), projectId]
  );
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<TaskWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT t.*, c.name as client_name, p.name as project_name, u.name as assignee_name
     FROM tasks t
     LEFT JOIN clients c ON t.client_id = c.id
     LEFT JOIN projects p ON t.project_id = p.id
     LEFT JOIN users u ON t.assigned_to = u.id
     ORDER BY t.position ASC, t.created_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    clientId: r.client_id,
    assignedTo: r.assigned_to,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    dueDate: r.due_date,
    tags: r.tags,
    position: r.position,
    completedAt: r.completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientName: r.client_name,
    projectName: r.project_name,
    assigneeName: r.assignee_name,
    parsedTags: safeJson<string[]>(r.tags, []),
  }));
}

export interface UpsertTaskInput {
  id?: string;
  projectId?: string | null;
  clientId?: string | null;
  assignedTo?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: number | null;
  tags?: string[];
}

export async function saveTask(input: UpsertTaskInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const tagsJson = JSON.stringify(input.tags || []);
  const completedAt = input.status === "done" ? now : null;

  if (input.id) {
    await db.execute(
      `UPDATE tasks SET
        project_id = $1, client_id = $2, assigned_to = $3,
        title = $4, description = $5, status = $6, priority = $7,
        due_date = $8, tags = $9, completed_at = $10, updated_at = $11
       WHERE id = $12`,
      [
        input.projectId || null,
        input.clientId || null,
        input.assignedTo || null,
        input.title,
        input.description || null,
        input.status,
        input.priority,
        input.dueDate || null,
        tagsJson,
        completedAt,
        now,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO tasks (
        id, project_id, client_id, assigned_to, title, description,
        status, priority, due_date, tags, position, completed_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, $12, $13)`,
      [
        newId,
        input.projectId || null,
        input.clientId || null,
        input.assignedTo || null,
        input.title,
        input.description || null,
        input.status,
        input.priority,
        input.dueDate || null,
        tagsJson,
        completedAt,
        now,
        now,
      ]
    );
    return newId;
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: string
): Promise<void> {
  const db = await getDatabase();
  const now = nowUnix();
  const completedAt = newStatus === "done" ? now : null;
  await db.execute(
    "UPDATE tasks SET status = $1, completed_at = $2, updated_at = $3 WHERE id = $4",
    [newStatus, completedAt, now, taskId]
  );
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function fetchUsers(): Promise<User[]> {
  const db = await getDatabase();
  return db.select<User[]>("SELECT * FROM users WHERE is_active = 1 ORDER BY name ASC");
}
