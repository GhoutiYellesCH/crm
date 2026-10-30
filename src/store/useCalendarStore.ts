import { create } from "zustand";
import {
  fetchCalendarEvents,
  saveCalendarEvent,
  deleteCalendarEvent,
  type CalendarEventWithDetails,
  type UpsertEventInput,
} from "@/services/calendarService";

interface CalendarState {
  events: CalendarEventWithDetails[];
  isLoading: boolean;
  selectedDate: Date;
  selectedTypeFilter: string;

  loadEvents: () => Promise<void>;
  saveEventData: (input: UpsertEventInput) => Promise<string>;
  removeEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setSelectedTypeFilter: (filter: string) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: false,
  selectedDate: new Date(),
  selectedTypeFilter: "all",

  loadEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await fetchCalendarEvents();
      set({ events });
    } catch (err) {
      console.error("[useCalendarStore] Failed to load events:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveEventData: async (input: UpsertEventInput) => {
    const id = await saveCalendarEvent(input);
    await get().loadEvents();
    return id;
  },

  removeEvent: async (id: string) => {
    await deleteCalendarEvent(id);
    await get().loadEvents();
  },

  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTypeFilter: (selectedTypeFilter) => set({ selectedTypeFilter }),
}));
