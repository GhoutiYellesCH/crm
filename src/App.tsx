import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useUIStore } from "./store/useUIStore";
import { initDb } from "./db/client";

function App() {
  const { theme, language } = useUIStore();

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

  // Initialize database
  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
