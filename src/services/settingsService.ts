import { getDatabase } from "@/db/client";
import { generateId, nowUnix } from "@/lib/utils";
import type { User, ApiKey, Setting } from "@/db/schema";

// ─── Users (Team Members) ───────────────────────────────────────────────────

export async function fetchTeamUsers(): Promise<User[]> {
  const db = await getDatabase();
  return db.select<User[]>("SELECT * FROM users ORDER BY role ASC, name ASC");
}

export interface UpsertUserInput {
  id?: string;
  name: string;
  email?: string | null;
  role: "owner" | "member" | "viewer";
  isActive?: boolean;
}

export async function saveTeamUser(input: UpsertUserInput): Promise<string> {
  const db = await getDatabase();
  const now = nowUnix();
  const isActive = input.isActive ?? true ? 1 : 0;

  if (input.id) {
    await db.execute(
      "UPDATE users SET name = $1, email = $2, role = $3, is_active = $4 WHERE id = $5",
      [input.name, input.email || null, input.role, isActive, input.id]
    );
    return input.id;
  } else {
    const newId = generateId();
    await db.execute(
      "INSERT INTO users (id, name, email, role, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [newId, input.name, input.email || null, input.role, isActive, now]
    );
    return newId;
  }
}

export async function deleteTeamUser(id: string): Promise<void> {
  // Prevent deleting default owner
  if (id === "owner-default") {
    throw new Error("Cannot delete primary owner account.");
  }
  const db = await getDatabase();
  await db.execute("DELETE FROM users WHERE id = $1", [id]);
}

// ─── API Keys (Hunter, Shodan, Google Maps, Apollo, etc.) ───────────────────

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const db = await getDatabase();
  return db.select<ApiKey[]>("SELECT * FROM api_keys ORDER BY provider ASC");
}

export async function saveApiKey(
  provider: string,
  apiKey: string,
  notes?: string
): Promise<void> {
  const db = await getDatabase();
  const now = nowUnix();
  const id = generateId();

  await db.execute(
    `INSERT INTO api_keys (id, provider, api_key, is_active, notes, created_at)
     VALUES ($1, $2, $3, 1, $4, $5)
     ON CONFLICT(provider) DO UPDATE SET
       api_key = excluded.api_key,
       notes = excluded.notes`,
    [id, provider, apiKey.trim(), notes || null, now]
  );
}

export async function deleteApiKey(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM api_keys WHERE id = $1", [id]);
}

// ─── App Settings ───────────────────────────────────────────────────────────

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDatabase();
    const rows = await db.select<Setting[]>(
      "SELECT * FROM settings WHERE key = $1 LIMIT 1",
      [key]
    );
    if (!rows || rows.length === 0) return defaultValue;
    return JSON.parse(rows[0].value) as T;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDatabase();
  const valJson = JSON.stringify(value);
  const now = nowUnix();
  await db.execute(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, valJson, now]
  );
}
