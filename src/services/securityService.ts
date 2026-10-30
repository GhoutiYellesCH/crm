import { getDatabase } from "@/db/client";
import { invoke } from "@tauri-apps/api/core";

const SALT_KEY = "app_lock_salt";
const HASH_KEY = "app_lock_hash";
const TIMEOUT_KEY = "app_lock_timeout";

export interface DatabaseInfo {
  configDir: string;
  dbPath: string;
  exists: boolean;
  sizeBytes: number;
  backupDir: string;
}

export interface UsbDrive {
  name: string;
  path: string;
}

/**
 * Converts ArrayBuffer to hexadecimal string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hashes a password string with a salt using SHA-256 via Web Crypto API.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + "::" + password + "::aegisflow_vault");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/**
 * Generates a cryptographic 16-byte random salt.
 */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/**
 * Security Service managing App Master Password and Local Database Backups.
 */
export const securityService = {
  /**
   * Checks whether a master password is configured.
   */
  async isPasswordConfigured(): Promise<boolean> {
    try {
      const db = await getDatabase();
      const rows = (await db.select(
        "SELECT value FROM settings WHERE key = $1",
        [HASH_KEY]
      )) as Array<{ value: string }>;

      if (rows && rows.length > 0 && rows[0].value) {
        return true;
      }
      // Fallback check in localStorage
      return !!localStorage.getItem(HASH_KEY);
    } catch {
      return !!localStorage.getItem(HASH_KEY);
    }
  },

  /**
   * Sets or changes the master password.
   */
  async setMasterPassword(password: string): Promise<void> {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    try {
      const db = await getDatabase();
      const now = Math.floor(Date.now() / 1000);

      // Upsert salt
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = $3`,
        [SALT_KEY, salt, now]
      );

      // Upsert hash
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = $3`,
        [HASH_KEY, hash, now]
      );
    } catch (e) {
      console.warn("Failed to persist master password in SQLite, writing to local vault:", e);
    }

    localStorage.setItem(SALT_KEY, salt);
    localStorage.setItem(HASH_KEY, hash);
  },

  /**
   * Verifies the provided password against the stored master password hash.
   */
  async verifyMasterPassword(password: string): Promise<boolean> {
    let salt = localStorage.getItem(SALT_KEY);
    let hash = localStorage.getItem(HASH_KEY);

    try {
      const db = await getDatabase();
      const saltRow = (await db.select(
        "SELECT value FROM settings WHERE key = $1",
        [SALT_KEY]
      )) as Array<{ value: string }>;
      const hashRow = (await db.select(
        "SELECT value FROM settings WHERE key = $1",
        [HASH_KEY]
      )) as Array<{ value: string }>;

      if (saltRow.length > 0 && hashRow.length > 0) {
        salt = saltRow[0].value;
        hash = hashRow[0].value;
      }
    } catch {
      // Use localStorage fallback
    }

    if (!salt || !hash) {
      return false;
    }

    const computed = await hashPassword(password, salt);
    return computed === hash;
  },

  /**
   * Removes master password protection (requires verifying the current password).
   */
  async removeMasterPassword(currentPassword: string): Promise<boolean> {
    const isValid = await this.verifyMasterPassword(currentPassword);
    if (!isValid) return false;

    try {
      const db = await getDatabase();
      await db.execute("DELETE FROM settings WHERE key IN ($1, $2)", [
        SALT_KEY,
        HASH_KEY,
      ]);
    } catch {
      // Ignore
    }

    localStorage.removeItem(SALT_KEY);
    localStorage.removeItem(HASH_KEY);
    return true;
  },

  /**
   * Gets the auto-lock inactivity timeout in minutes (0 = disabled).
   */
  async getAutoLockMinutes(): Promise<number> {
    try {
      const db = await getDatabase();
      const row = (await db.select(
        "SELECT value FROM settings WHERE key = $1",
        [TIMEOUT_KEY]
      )) as Array<{ value: string }>;
      if (row.length > 0 && row[0].value) {
        return parseInt(row[0].value, 10) || 0;
      }
    } catch {
      // Fallback
    }
    const val = localStorage.getItem(TIMEOUT_KEY);
    return val ? parseInt(val, 10) : 15;
  },

  /**
   * Sets the auto-lock inactivity timeout in minutes.
   */
  async setAutoLockMinutes(minutes: number): Promise<void> {
    try {
      const db = await getDatabase();
      const now = Math.floor(Date.now() / 1000);
      await db.execute(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = $3`,
        [TIMEOUT_KEY, minutes.toString(), now]
      );
    } catch {
      // Fallback
    }
    localStorage.setItem(TIMEOUT_KEY, minutes.toString());
  },

  // ── Database & USB Backup Bridge ──

  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      return await invoke<DatabaseInfo>("get_db_info");
    } catch {
      return {
        configDir: "~/.config/aegisflow",
        dbPath: "~/.config/aegisflow/crm.db",
        exists: true,
        sizeBytes: 0,
        backupDir: "~/.config/aegisflow/backups",
      };
    }
  },

  async openDataDirectory(): Promise<void> {
    await invoke("open_data_dir");
  },

  async createBackup(destDir?: string): Promise<string> {
    return await invoke<string>("create_backup", {
      customDestDir: destDir || null,
    });
  },

  async restoreBackup(backupFilePath: string): Promise<string> {
    return await invoke<string>("restore_backup", {
      backupFilePath,
    });
  },

  async detectUsbDrives(): Promise<UsbDrive[]> {
    try {
      return await invoke<UsbDrive[]>("detect_usb_drives");
    } catch {
      return [];
    }
  },
};
