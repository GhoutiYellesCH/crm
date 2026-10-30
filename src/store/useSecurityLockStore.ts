import { create } from "zustand";
import {
  securityService,
  DatabaseInfo,
  UsbDrive,
} from "@/services/securityService";

interface SecurityLockState {
  isLocked: boolean;
  isPasswordConfigured: boolean;
  isLoading: boolean;
  autoLockMinutes: number;
  lastActive: number;

  // DB info
  dbInfo: DatabaseInfo | null;
  usbDrives: UsbDrive[];

  // Actions
  initialize: () => Promise<void>;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
  setMasterPassword: (password: string) => Promise<void>;
  removeMasterPassword: (currentPassword: string) => Promise<boolean>;
  setAutoLockMinutes: (minutes: number) => Promise<void>;
  recordActivity: () => void;
  checkAutoLock: () => void;

  // Backups
  refreshDbInfo: () => Promise<void>;
  detectUsbDrives: () => Promise<void>;
  createBackup: (destDir?: string) => Promise<string>;
  restoreBackup: (filePath: string) => Promise<string>;
}

export const useSecurityLockStore = create<SecurityLockState>((set, get) => ({
  isLocked: false,
  isPasswordConfigured: false,
  isLoading: true,
  autoLockMinutes: 15,
  lastActive: Date.now(),
  dbInfo: null,
  usbDrives: [],

  initialize: async () => {
    try {
      const hasPassword = await securityService.isPasswordConfigured();
      const timeout = await securityService.getAutoLockMinutes();
      const dbInfo = await securityService.getDatabaseInfo();

      set({
        isPasswordConfigured: hasPassword,
        // If password is configured, lock immediately on startup
        isLocked: hasPassword,
        autoLockMinutes: timeout,
        dbInfo,
        isLoading: false,
        lastActive: Date.now(),
      });

      // Detect USB drives
      get().detectUsbDrives().catch(() => {});
    } catch (err) {
      console.error("Security init error:", err);
      set({ isLoading: false });
    }
  },

  lock: () => {
    if (get().isPasswordConfigured) {
      set({ isLocked: true });
    }
  },

  unlock: async (password: string) => {
    const isValid = await securityService.verifyMasterPassword(password);
    if (isValid) {
      set({ isLocked: false, lastActive: Date.now() });
      return true;
    }
    return false;
  },

  setMasterPassword: async (password: string) => {
    await securityService.setMasterPassword(password);
    set({ isPasswordConfigured: true });
  },

  removeMasterPassword: async (currentPassword: string) => {
    const success = await securityService.removeMasterPassword(currentPassword);
    if (success) {
      set({ isPasswordConfigured: false, isLocked: false });
      return true;
    }
    return false;
  },

  setAutoLockMinutes: async (minutes: number) => {
    await securityService.setAutoLockMinutes(minutes);
    set({ autoLockMinutes: minutes });
  },

  recordActivity: () => {
    set({ lastActive: Date.now() });
  },

  checkAutoLock: () => {
    const { isLocked, isPasswordConfigured, autoLockMinutes, lastActive } = get();
    if (!isLocked && isPasswordConfigured && autoLockMinutes > 0) {
      const elapsedMinutes = (Date.now() - lastActive) / 1000 / 60;
      if (elapsedMinutes >= autoLockMinutes) {
        console.log(`[Security] Auto-locking after ${elapsedMinutes.toFixed(1)}m of inactivity`);
        set({ isLocked: true });
      }
    }
  },

  refreshDbInfo: async () => {
    const dbInfo = await securityService.getDatabaseInfo();
    set({ dbInfo });
  },

  detectUsbDrives: async () => {
    const drives = await securityService.detectUsbDrives();
    set({ usbDrives: drives });
  },

  createBackup: async (destDir?: string) => {
    const path = await securityService.createBackup(destDir);
    await get().refreshDbInfo();
    return path;
  },

  restoreBackup: async (filePath: string) => {
    const res = await securityService.restoreBackup(filePath);
    await get().refreshDbInfo();
    return res;
  },
}));
