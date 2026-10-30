import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useUIStore } from "@/store/useUIStore";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AppShell() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-200",
          )}
        >
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
