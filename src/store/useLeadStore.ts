import { create } from "zustand";
import {
  fetchLeads,
  fetchLeadById,
  saveLead,
  enrichLeadRecord,
  convertLeadToClient,
  logOutreachAttempt,
  updateLeadStage,
  deleteLead,
  type LeadWithDetails,
  type UpsertLeadInput,
} from "@/services/lead/leadService";
import { discoverDomainsViaCrtSh } from "@/services/lead/osintService";

interface LeadState {
  leads: LeadWithDetails[];
  selectedLead: LeadWithDetails | null;
  isLoading: boolean;
  isDiscovering: boolean;
  selectedStage: string;
  minScoreFilter: number;
  searchQuery: string;

  loadLeads: () => Promise<void>;
  selectLead: (id: string | null) => Promise<void>;
  saveLeadData: (input: UpsertLeadInput) => Promise<string>;
  enrichLead: (id: string) => Promise<void>;
  convertLead: (id: string) => Promise<string>;
  logOutreach: (
    id: string,
    type: "email" | "call" | "meeting" | "note",
    subject: string,
    content: string
  ) => Promise<void>;
  changeLeadStage: (id: string, stage: string) => Promise<void>;
  removeLead: (id: string) => Promise<void>;

  discoverFromKeyword: (keyword: string) => Promise<number>;

  setSelectedStage: (stage: string) => void;
  setMinScoreFilter: (score: number) => void;
  setSearchQuery: (query: string) => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  selectedLead: null,
  isLoading: false,
  isDiscovering: false,
  selectedStage: "all",
  minScoreFilter: 0,
  searchQuery: "",

  loadLeads: async () => {
    set({ isLoading: true });
    try {
      const leads = await fetchLeads();
      set({ leads });
    } catch (err) {
      console.error("[useLeadStore] Failed to load leads:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectLead: async (id: string | null) => {
    if (!id) {
      set({ selectedLead: null });
      return;
    }
    set({ isLoading: true });
    try {
      const lead = await fetchLeadById(id);
      set({ selectedLead: lead });
    } catch (err) {
      console.error("[useLeadStore] selectLead error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveLeadData: async (input: UpsertLeadInput) => {
    const id = await saveLead(input);
    await get().loadLeads();
    if (get().selectedLead?.id === id) {
      await get().selectLead(id);
    }
    return id;
  },

  enrichLead: async (id: string) => {
    await enrichLeadRecord(id);
    await get().selectLead(id);
    await get().loadLeads();
  },

  convertLead: async (id: string) => {
    const clientId = await convertLeadToClient(id);
    await get().selectLead(id);
    await get().loadLeads();
    return clientId;
  },

  logOutreach: async (id, type, subject, content) => {
    await logOutreachAttempt(id, type, subject, content);
    await get().selectLead(id);
    await get().loadLeads();
  },

  changeLeadStage: async (id: string, stage: string) => {
    await updateLeadStage(id, stage);
    await get().loadLeads();
    if (get().selectedLead?.id === id) {
      await get().selectLead(id);
    }
  },

  removeLead: async (id: string) => {
    await deleteLead(id);
    if (get().selectedLead?.id === id) {
      set({ selectedLead: null });
    }
    await get().loadLeads();
  },

  discoverFromKeyword: async (keyword: string) => {
    set({ isDiscovering: true });
    try {
      const discovered = await discoverDomainsViaCrtSh(keyword);
      let count = 0;
      for (const item of discovered) {
        await saveLead({
          companyName: item.companyName,
          website: item.website,
          source: item.source,
          stage: "discovered",
        });
        count++;
      }
      await get().loadLeads();
      return count;
    } finally {
      set({ isDiscovering: false });
    }
  },

  setSelectedStage: (selectedStage) => set({ selectedStage }),
  setMinScoreFilter: (minScoreFilter) => set({ minScoreFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
