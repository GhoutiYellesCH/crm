import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderKanban,
  DollarSign,
  Bookmark,
  Target,
  Calendar,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_GROUPS = [
  {
    label: "CRM",
    items: [
      { to: "/", icon: LayoutDashboard, key: "dashboard" },
      { to: "/clients", icon: Users, key: "clients" },
      { to: "/leads", icon: Target, key: "leads" },
    ],
  },
  {
    label: "Work",
    items: [
      { to: "/tasks", icon: CheckSquare, key: "tasks" },
      { to: "/projects", icon: FolderKanban, key: "projects" },
      { to: "/calendar", icon: Calendar, key: "calendar" },
    ],
  },
  {
    label: "Money",
    items: [{ to: "/finance", icon: DollarSign, key: "finance" }],
  },
  {
    label: "Tools",
    items: [
      { to: "/bookmarks", icon: Bookmark, key: "bookmarks" },
      { to: "/audit", icon: Shield, key: "audit" },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const isRTL = document.documentElement.dir === "rtl";

  const CollapseIcon = isRTL
    ? sidebarCollapsed
      ? ChevronLeft
      : ChevronRight
    : sidebarCollapsed
    ? ChevronRight
    : ChevronLeft;

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar border-sidebar-border transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo / App Name */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-sidebar-border px-3 gap-3 shrink-0",
          sidebarCollapsed && "justify-center"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <span className="text-primary-foreground font-bold text-sm">P</span>
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm text-sidebar-foreground truncate">
            Personal CRM
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {group.label}
              </p>
            )}
            {sidebarCollapsed && <Separator className="my-1" />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.key}
                  to={item.to}
                  icon={item.icon}
                  label={t(`nav.${item.key}`)}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Settings + Collapse */}
      <div className="border-t border-sidebar-border px-2 py-2 space-y-0.5 shrink-0">
        <NavItem
          to="/settings"
          icon={Settings}
          label={t("nav.settings")}
          collapsed={sidebarCollapsed}
        />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-muted-foreground hover:text-sidebar-foreground",
            sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3 px-2"
          )}
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-xs">Collapse</span>
          )}
        </Button>
      </div>
    </aside>
  );
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}

function NavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  const item = (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md text-sm font-medium transition-colors",
          "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          collapsed ? "justify-center h-9 w-9 mx-auto" : "gap-3 px-2 h-9"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return item;
}
