import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

type Theme = "dark" | "light";
type Language = "en" | "fr" | "ar";

interface UIState {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      language: "en",
      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: "crm-ui-store",
    }
  )
);
