import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useUIStore } from "./store/useUIStore";
import { useSecurityLockStore } from "./store/useSecurityLockStore";
import { LockScreen } from "./components/security/LockScreen";
import { initDb } from "./db/client";

function App() {
  const { theme, language } = useUIStore();
  const { initialize, recordActivity, checkAutoLock } = useSecurityLockStore();

  // Apply theme class to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

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
