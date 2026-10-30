import { create } from "zustand";
import {
  fetchBookmarks,
  saveBookmark,
  togglePinBookmark,
  deleteBookmark,
  type BookmarkWithDetails,
  type UpsertBookmarkInput,
} from "@/services/bookmarkService";

interface BookmarkState {
  bookmarks: BookmarkWithDetails[];
  isLoading: boolean;
  selectedCategory: string;
  searchQuery: string;

  loadBookmarks: () => Promise<void>;
  saveBookmarkData: (input: UpsertBookmarkInput) => Promise<string>;
  togglePin: (id: string, currentPinned: boolean) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  selectedCategory: "all",
  searchQuery: "",

  loadBookmarks: async () => {
    set({ isLoading: true });
    try {
      const bookmarks = await fetchBookmarks();
      set({ bookmarks });
    } catch (err) {
      console.error("[useBookmarkStore] Failed to load bookmarks:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveBookmarkData: async (input: UpsertBookmarkInput) => {
    const id = await saveBookmark(input);
    await get().loadBookmarks();
    return id;
  },

  togglePin: async (id: string, currentPinned: boolean) => {
    await togglePinBookmark(id, !currentPinned);
    await get().loadBookmarks();
  },

  removeBookmark: async (id: string) => {
    await deleteBookmark(id);
    await get().loadBookmarks();
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
