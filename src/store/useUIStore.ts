import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

export type Theme = "tokyo-night" | "dark" | "light" | "cyberpunk" | "nord" | "custom";
export type Language = "en" | "fr" | "ar";

export interface CustomThemeColors {
  background: string;   // hex e.g. #1a1b26
  foreground: string;   // hex e.g. #c0caf5
  card: string;         // hex e.g. #24283b
  primary: string;      // hex e.g. #7aa2f7
  border: string;       // hex e.g. #2f354f
  sidebar: string;      // hex e.g. #16161e
}

export const DEFAULT_CUSTOM_THEME: CustomThemeColors = {
  background: "#1a1b26",
  foreground: "#c0caf5",
  card: "#24283b",
  primary: "#7aa2f7",
  border: "#2f354f",
  sidebar: "#16161e",
};

interface UIState {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  mainCurrency: string; // e.g. "DZD", "EUR", "USD"
  customTheme: CustomThemeColors;

  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setMainCurrency: (curr: string) => void;
  setCustomTheme: (colors: Partial<CustomThemeColors>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "tokyo-night",
      language: "en",
      sidebarCollapsed: false,
      mainCurrency: "DZD",
      customTheme: DEFAULT_CUSTOM_THEME,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      toggleTheme: () =>
        set((s) => ({
          theme: s.theme === "tokyo-night" ? "light" : "tokyo-night",
        })),

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setMainCurrency: (mainCurrency) => set({ mainCurrency }),

      setCustomTheme: (colors) =>
        set((s) => ({
          customTheme: { ...s.customTheme, ...colors },
        })),
    }),
    {
      name: "crm-ui-store",
    }
  )
);
