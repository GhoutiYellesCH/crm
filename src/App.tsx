import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useUIStore } from "./store/useUIStore";
import { useSecurityLockStore } from "./store/useSecurityLockStore";
import { LockScreen } from "./components/security/LockScreen";
import { initDb } from "./db/client";
import { hexToHslChannels } from "./lib/colorUtils";

function App() {
  const { theme, customTheme, language } = useUIStore();
  const { initialize, recordActivity, checkAutoLock } = useSecurityLockStore();

  // Apply theme class to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "tokyo-night", "nord", "cyberpunk", "custom");
    root.classList.add(theme);

    if (theme === "custom" && customTheme) {
      root.style.setProperty("--background", hexToHslChannels(customTheme.background));
      root.style.setProperty("--card", hexToHslChannels(customTheme.card));
      root.style.setProperty("--popover", hexToHslChannels(customTheme.card));
      root.style.setProperty("--primary", hexToHslChannels(customTheme.primary));
      root.style.setProperty("--foreground", hexToHslChannels(customTheme.foreground));
      root.style.setProperty("--card-foreground", hexToHslChannels(customTheme.foreground));
      root.style.setProperty("--border", hexToHslChannels(customTheme.border));
      root.style.setProperty("--input", hexToHslChannels(customTheme.border));
      root.style.setProperty("--sidebar", hexToHslChannels(customTheme.sidebar));
      root.style.setProperty("--sidebar-border", hexToHslChannels(customTheme.border));
    } else {
      root.style.removeProperty("--background");
      root.style.removeProperty("--card");
      root.style.removeProperty("--popover");
      root.style.removeProperty("--primary");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--border");
      root.style.removeProperty("--input");
      root.style.removeProperty("--sidebar");
      root.style.removeProperty("--sidebar-border");
    }
  }, [theme, customTheme]);

  // Apply RTL direction for Arabic
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Initialize database & security vault
  useEffect(() => {
    initDb()
      .then(() => initialize())
      .catch(console.error);
  }, [initialize]);

  // Activity listener & auto-lock interval
  useEffect(() => {
    const handleActivity = () => recordActivity();
    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });

    const interval = setInterval(() => {
      checkAutoLock();
    }, 15000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [recordActivity, checkAutoLock]);

  return (
    <>
      <LockScreen />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
