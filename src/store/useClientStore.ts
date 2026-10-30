import { create } from "zustand";
import {
  fetchClients,
  fetchClientById,
  saveClient,
  deleteClient,
  addClientContact,
  deleteContact,
  addClientNote,
  deleteNote,
  type ClientWithDetails,
  type UpsertClientInput,
} from "@/services/clientService";

interface ClientState {
  clients: ClientWithDetails[];
  selectedClient: ClientWithDetails | null;
  isLoading: boolean;
  searchQuery: string;
  selectedStatus: string;
  selectedServiceTag: string;

  // Actions
  loadClients: () => Promise<void>;
  selectClient: (id: string | null) => Promise<void>;
  saveClientData: (input: UpsertClientInput) => Promise<string>;
  removeClient: (id: string) => Promise<void>;
  addContact: (
    clientId: string,
    contact: { name: string; role?: string; email?: string; phone?: string; linkedin?: string; isPrimary?: boolean; notes?: string }
  ) => Promise<void>;
  removeContact: (contactId: string, clientId: string) => Promise<void>;
  addNote: (clientId: string, content: string) => Promise<void>;
  removeNote: (noteId: string, clientId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedServiceTag: (tag: string) => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,
  searchQuery: "",
  selectedStatus: "all",
  selectedServiceTag: "all",

  loadClients: async () => {
    set({ isLoading: true });
    try {
      const clients = await fetchClients();
      set({ clients });
    } catch (err) {
      console.error("[useClientStore] Failed to load clients:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectClient: async (id: string | null) => {
    if (!id) {
      set({ selectedClient: null });
      return;
    }
    set({ isLoading: true });
    try {
      const client = await fetchClientById(id);
      set({ selectedClient: client });
    } catch (err) {
      console.error("[useClientStore] Failed to fetch client:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveClientData: async (input: UpsertClientInput) => {
    const id = await saveClient(input);
    await get().loadClients();
    if (get().selectedClient?.id === id || !get().selectedClient) {
      await get().selectClient(id);
    }
    return id;
  },

  removeClient: async (id: string) => {
    await deleteClient(id);
    if (get().selectedClient?.id === id) {
      set({ selectedClient: null });
    }
    await get().loadClients();
  },

  addContact: async (clientId, contact) => {
    await addClientContact(clientId, contact);
    await get().selectClient(clientId);
  },

  removeContact: async (contactId, clientId) => {
    await deleteContact(contactId);
    await get().selectClient(clientId);
  },

  addNote: async (clientId, content) => {
    await addClientNote(clientId, content);
    await get().selectClient(clientId);
    await get().loadClients();
  },

  removeNote: async (noteId, clientId) => {
    await deleteNote(noteId);
    await get().selectClient(clientId);
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedServiceTag: (selectedServiceTag) => set({ selectedServiceTag }),
}));
