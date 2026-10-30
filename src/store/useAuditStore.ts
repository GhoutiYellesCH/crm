import { create } from "zustand";
import {
  fetchAuditSessions,
  saveAuditSession,
  deleteAuditSession,
  type AuditSessionWithDetails,
  type UpsertAuditInput,
} from "@/services/auditService";
import type { Finding } from "@/services/pdf/auditPdf";

interface AuditState {
  sessions: AuditSessionWithDetails[];
  selectedSession: AuditSessionWithDetails | null;
  isLoading: boolean;

  loadSessions: () => Promise<void>;
  selectSession: (id: string | null) => void;
  saveSessionData: (input: UpsertAuditInput) => Promise<string>;
  removeSession: (id: string) => Promise<void>;
  addFindingToSession: (sessionId: string, finding: Finding) => Promise<void>;
  toggleAuditChecklistItem: (sessionId: string, level: string, itemId: string) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,

  loadSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await fetchAuditSessions();
      set({ sessions });
      if (get().selectedSession) {
        const refreshed = sessions.find((s) => s.id === get().selectedSession?.id);
        if (refreshed) set({ selectedSession: refreshed });
      }
    } catch (err) {
      console.error("[useAuditStore] Failed to load audits:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectSession: (id: string | null) => {
    if (!id) {
      set({ selectedSession: null });
      return;
    }
    const s = get().sessions.find((x) => x.id === id) || null;
    set({ selectedSession: s });
  },

  saveSessionData: async (input: UpsertAuditInput) => {
    const id = await saveAuditSession(input);
    await get().loadSessions();
    get().selectSession(id);
    return id;
  },

  removeSession: async (id: string) => {
    await deleteAuditSession(id);
    if (get().selectedSession?.id === id) {
      set({ selectedSession: null });
    }
    await get().loadSessions();
  },

  addFindingToSession: async (sessionId: string, finding: Finding) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updatedFindings = [...session.parsedFindings, finding];
    await get().saveSessionData({
      id: session.id,
      title: session.title,
      level: session.level,
      status: session.status,
      scope: session.scope,
      notes: session.notes,
      findings: updatedFindings,
      checklist: session.parsedChecklist,
    });
  },

  toggleAuditChecklistItem: async (sessionId: string, level: string, itemId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const currentList = session.parsedChecklist[level] || [];
    const updatedList = currentList.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    const updatedChecklist = {
      ...session.parsedChecklist,
      [level]: updatedList,
    };

    await get().saveSessionData({
      id: session.id,
      title: session.title,
      level: session.level,
      status: session.status,
      scope: session.scope,
      notes: session.notes,
      findings: session.parsedFindings,
      checklist: updatedChecklist,
    });
  },
}));
