import { getDatabase } from "@/db/client";
import { generateId, nowUnix } from "@/lib/utils";
import type { CalendarEvent } from "@/db/schema";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

export interface CalendarEventWithDetails extends CalendarEvent {
  clientName?: string;
  clientCompany?: string;
  taskTitle?: string;
  leadName?: string;
}

export const EVENT_TYPES = [
  { value: "meeting", label: "Client Meeting", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
  { value: "deadline", label: "Project Deadline", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", dot: "bg-rose-400" },
  { value: "follow_up", label: "Lead Follow-up", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
  { value: "reminder", label: "General Reminder", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
] as const;

export async function fetchCalendarEvents(): Promise<CalendarEventWithDetails[]> {
  const db = await getDatabase();
  const rows = await db.select<any[]>(
    `SELECT e.*, c.name as client_name, c.company as client_company,
            t.title as task_title, l.company_name as lead_name
     FROM calendar_events e
     LEFT JOIN clients c ON e.client_id = c.id
     LEFT JOIN tasks t ON e.task_id = t.id
     LEFT JOIN leads l ON e.lead_id = l.id
     ORDER BY e.start_at ASC`
  );

  return rows.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    taskId: r.task_id,
    leadId: r.lead_id,
    title: r.title,
    description: r.description,
    type: r.type,
    startAt: r.start_at,
    endAt: r.end_at,
    allDay: r.all_day,
    recurrence: r.recurrence,
    remindAt: r.remind_at,
    createdAt: r.created_at,
    clientName: r.client_name,
    clientCompany: r.client_company,
    taskTitle: r.task_title,
    leadName: r.lead_name,
  }));
}

export interface UpsertEventInput {
  id?: string;
  clientId?: string | null;
  taskId?: string | null;
  leadId?: string | null;
  title: string;
  description?: string | null;
  type?: string;
  startAt: number;
  endAt: number;
  allDay?: boolean;
}

export async function saveCalendarEvent(input: UpsertEventInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();

  if (input.id) {
    await db.execute(
      `UPDATE calendar_events SET
        client_id = $1, task_id = $2, lead_id = $3, title = $4,
        description = $5, type = $6, start_at = $7, end_at = $8,
        all_day = $9
       WHERE id = $10`,
      [
        input.clientId || null,
        input.taskId || null,
        input.leadId || null,
        input.title,
        input.description || null,
        input.type || "meeting",
        input.startAt,
        input.endAt,
        input.allDay ? 1 : 0,
        input.id,
      ]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      `INSERT INTO calendar_events (
        id, client_id, task_id, lead_id, title, description,
        type, start_at, end_at, all_day, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        newId,
        input.clientId || null,
        input.taskId || null,
        input.leadId || null,
        input.title,
        input.description || null,
        input.type || "meeting",
        input.startAt,
        input.endAt,
        input.allDay ? 1 : 0,
        now,
      ]
    );

    // Trigger desktop notification if supported
    try {
      let permitted = await isPermissionGranted();
      if (!permitted) {
        const permission = await requestPermission();
        permitted = permission === "granted";
      }
      if (permitted) {
        sendNotification({
          title: `Scheduled: ${input.title}`,
          body: `Added to your calendar workflow for ${new Date(input.startAt * 1000).toLocaleString()}`,
        });
      }
    } catch (e) {
      // Desktop notifications unavailable in plain browser test mode
      console.log("[Notification] Triggered:", input.title);
    }

    return newId;
  }
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM calendar_events WHERE id = $1", [id]);
}
