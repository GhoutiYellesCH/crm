import { create } from "zustand";
import {
  fetchTeamUsers,
  saveTeamUser,
  deleteTeamUser,
  fetchApiKeys,
  saveApiKey,
  deleteApiKey,
  type UpsertUserInput,
} from "@/services/settingsService";
import type { User, ApiKey } from "@/db/schema";

interface SettingsState {
  users: User[];
  apiKeys: ApiKey[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  saveUser: (input: UpsertUserInput) => Promise<string>;
  removeUser: (id: string) => Promise<void>;
  saveKey: (provider: string, apiKey: string, notes?: string) => Promise<void>;
  removeKey: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  users: [],
  apiKeys: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [users, apiKeys] = await Promise.all([
        fetchTeamUsers(),
        fetchApiKeys(),
      ]);
      set({ users, apiKeys });
    } catch (err) {
      console.error("[useSettingsStore] Failed to load settings data:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveUser: async (input: UpsertUserInput) => {
    const id = await saveTeamUser(input);
    await get().loadData();
    return id;
  },

  removeUser: async (id: string) => {
    await deleteTeamUser(id);
    await get().loadData();
  },

  saveKey: async (provider: string, apiKey: string, notes?: string) => {
    await saveApiKey(provider, apiKey, notes);
    await get().loadData();
  },

  removeKey: async (id: string) => {
    await deleteApiKey(id);
    await get().loadData();
  },
}));
