import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

let _database: Database | null = null;

/**
 * Gets or creates the singleton SQLite connection.
 */
export async function getDatabase(): Promise<Database> {
  if (!_database) {
    let dbUrl = "sqlite:crm.db";
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const info = await invoke<{ dbPath: string }>("get_db_info");
      if (info?.dbPath) {
        dbUrl = `sqlite:${info.dbPath}`;
      }
    } catch {
      // Fallback if running outside Tauri
    }
    _database = await Database.load(dbUrl);
  }
  return _database;
}

/**
 * Initializes the database (call once on app start).
 * Migrations are handled by tauri-plugin-sql on the Rust side.
 */
export async function initDb(): Promise<void> {
  await getDatabase();
  console.log("[DB] Connected to crm.db");
}

/**
 * Creates a Drizzle ORM instance using the sqlite-proxy adapter
 * which bridges to tauri-plugin-sql.
 */
export async function createDrizzle() {
  const db = await getDatabase();

  return drizzle<typeof schema>(
    async (sql, params, method) => {
      try {
        if (method === "run") {
          await db.execute(sql, params as unknown[]);
          return { rows: [] };
        }

        const rows = (await db.select(sql, params as unknown[])) as Record<
          string,
          unknown
        >[];

        // drizzle sqlite-proxy expects rows as arrays
        return {
          rows: rows.map((row) => Object.values(row)),
        };
      } catch (error) {
        console.error("[DB] Query error:", sql, params, error);
        throw error;
      }
    },
    { schema, logger: import.meta.env.DEV }
  );
}

// Singleton drizzle instance
let _drizzle: Awaited<ReturnType<typeof createDrizzle>> | null = null;

export async function getDb() {
  if (!_drizzle) {
    _drizzle = await createDrizzle();
  }
  return _drizzle;
}
