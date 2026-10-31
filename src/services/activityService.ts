import { getDatabase } from "@/db/client";
import { generateId, nowUnix } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  entityType: "task" | "project" | "client" | "lead" | "invoice";
  entityId?: string;
  action: "completed" | "created" | "updated" | "contacted" | "paid";
  title: string;
  metadata?: string;
  createdAt: number; // unix timestamp in seconds
}

export interface DayActivity {
  dateString: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  activities: { title: string; type: string; action: string; time: string }[];
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalActivities: number;
}

/**
 * Record a new activity entry in the database.
 */
export async function logActivity(
  entityType: "task" | "project" | "client" | "lead" | "invoice",
  action: "completed" | "created" | "updated" | "contacted" | "paid",
  title: string,
  entityId?: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const db = await getDatabase();
    const id = generateId();
    const now = nowUnix();
    await db.execute(
      `INSERT INTO activity_logs (id, entity_type, entity_id, action, title, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, entityType, entityId || null, action, title, JSON.stringify(metadata), now]
    );
  } catch (err) {
    console.error("[logActivity] error logging:", err);
  }
}

/**
 * Fetch all activity items from activity_logs + synthesize historical activities
 * from tasks, outreach, invoices, and projects.
 */
export async function fetchAllActivities(): Promise<ActivityItem[]> {
  const db = await getDatabase();
  const list: ActivityItem[] = [];

  try {
    // 1. Direct activity logs
    const logs = await db.select<any[]>(
      `SELECT id, entity_type as entityType, entity_id as entityId, action, title, metadata, created_at as createdAt 
       FROM activity_logs ORDER BY created_at DESC LIMIT 2000`
    );
    if (Array.isArray(logs)) {
      list.push(...logs);
    }
  } catch (e) {
    console.warn("Could not query activity_logs:", e);
  }

  try {
    // 2. Synthesize completed tasks
    const taskRows = await db.select<any[]>(
      `SELECT id, title, completed_at as completedAt, created_at as createdAt, status FROM tasks`
    );
    if (Array.isArray(taskRows)) {
      for (const t of taskRows) {
        if (t.completedAt && t.completedAt > 0) {
          list.push({
            id: `task-comp-${t.id}`,
            entityType: "task",
            entityId: t.id,
            action: "completed",
            title: `Completed task: ${t.title}`,
            createdAt: t.completedAt,
          });
        }
        if (t.createdAt && t.createdAt > 0) {
          list.push({
            id: `task-create-${t.id}`,
            entityType: "task",
            entityId: t.id,
            action: "created",
            title: `Created task: ${t.title}`,
            createdAt: t.createdAt,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not query tasks for activity:", e);
  }

  try {
    // 3. Synthesize lead outreach
    const outreach = await db.select<any[]>(
      `SELECT id, type, subject, date FROM outreach_log`
    );
    if (Array.isArray(outreach)) {
      for (const o of outreach) {
        if (o.date && o.date > 0) {
          list.push({
            id: `outreach-${o.id}`,
            entityType: "lead",
            entityId: o.id,
            action: "contacted",
            title: `Outreach (${o.type}): ${o.subject || "Contacted Lead"}`,
            createdAt: o.date,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not query outreach_log:", e);
  }

  try {
    // 4. Synthesize invoices
    const invoiceRows = await db.select<any[]>(
      `SELECT id, number, status, issue_date as issueDate, paid_at as paidAt FROM invoices`
    );
    if (Array.isArray(invoiceRows)) {
      for (const inv of invoiceRows) {
        if (inv.paidAt && inv.paidAt > 0) {
          list.push({
            id: `inv-paid-${inv.id}`,
            entityType: "invoice",
            entityId: inv.id,
            action: "paid",
            title: `Invoice paid: ${inv.number}`,
            createdAt: inv.paidAt,
          });
        } else if (inv.issueDate && inv.issueDate > 0) {
          list.push({
            id: `inv-create-${inv.id}`,
            entityType: "invoice",
            entityId: inv.id,
            action: "created",
            title: `Issued invoice: ${inv.number}`,
            createdAt: inv.issueDate,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not query invoices for activity:", e);
  }

  return list;
}

/**
 * Computes 365-day Activity Heatmap matrix and Streak stats.
 */
export function computeHeatmapAndStreaks(
  activities: ActivityItem[],
  daysCount: number = 365
): {
  daysMap: Record<string, DayActivity>;
  weeks: DayActivity[][];
  streakStats: StreakStats;
} {
  const daysMap: Record<string, DayActivity> = {};
  const today = new Date();

  // Initialize all days in the range
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    daysMap[dateStr] = {
      dateString: dateStr,
      count: 0,
      level: 0,
      activities: [],
    };
  }

  // Populate activities
  for (const act of activities) {
    const d = new Date(act.createdAt * 1000);
    const dateStr = d.toISOString().split("T")[0];
    if (daysMap[dateStr]) {
      daysMap[dateStr].count += 1;
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      daysMap[dateStr].activities.push({
        title: act.title,
        type: act.entityType,
        action: act.action,
        time: timeStr,
      });
    }
  }

  // Calculate intensity levels (0 to 4)
  for (const dateStr in daysMap) {
    const count = daysMap[dateStr].count;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count === 0) level = 0;
    else if (count <= 2) level = 1;
    else if (count <= 5) level = 2;
    else if (count <= 8) level = 3;
    else level = 4;
    daysMap[dateStr].level = level;
  }

  // Calculate Streaks
  const sortedDates = Object.keys(daysMap).sort(); // chronological order
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let totalActiveDays = 0;
  let totalActivities = 0;

  for (const dateStr of sortedDates) {
    const count = daysMap[dateStr].count;
    totalActivities += count;
    if (count > 0) {
      totalActiveDays++;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Calculate Current Streak backwards from today
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let checkDate = new Date(today);
  // If no activity today, check if yesterday was active to keep streak alive
  if ((daysMap[todayStr]?.count || 0) === 0) {
    if ((daysMap[yesterdayStr]?.count || 0) > 0) {
      checkDate = yesterday;
    } else {
      currentStreak = 0;
      checkDate = new Date(0); // break
    }
  }

  if (checkDate.getTime() > 0) {
    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      if (daysMap[dStr] && daysMap[dStr].count > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Group into columns of 7 days (weeks Sunday-Saturday or Monday-Sunday)
  // Let's create columns of weeks
  const allDaysList = sortedDates.map((d) => daysMap[d]);
  const weeks: DayActivity[][] = [];
  let currentWeek: DayActivity[] = [];

  // Align first day to day of week (0 = Sunday)
  const firstDate = new Date(sortedDates[0]);
  const startDayOfWeek = firstDate.getDay(); // 0 is Sunday
  for (let i = 0; i < startDayOfWeek; i++) {
    // Empty filler for alignment
    currentWeek.push({
      dateString: "",
      count: 0,
      level: 0,
      activities: [],
    });
  }

  for (const day of allDaysList) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        dateString: "",
        count: 0,
        level: 0,
        activities: [],
      });
    }
    weeks.push(currentWeek);
  }

  return {
    daysMap,
    weeks,
    streakStats: {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActiveDays,
      totalActivities,
    },
  };
}
