import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import ClientList from "./pages/clients/ClientList";
import TaskBoard from "./pages/tasks/TaskBoard";
import ProjectList from "./pages/projects/ProjectList";
import FinanceOverview from "./pages/finance/Overview";
import BookmarkHub from "./pages/bookmarks/BookmarkHub";
import LeadFunnel from "./pages/leads/LeadFunnel";
import CalendarView from "./pages/calendar/CalendarView";
import AuditList from "./pages/audit/AuditList";
import Settings from "./pages/settings/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "clients", element: <ClientList /> },
      { path: "tasks", element: <TaskBoard /> },
      { path: "projects", element: <ProjectList /> },
      { path: "finance", element: <FinanceOverview /> },
      { path: "bookmarks", element: <BookmarkHub /> },
      { path: "leads", element: <LeadFunnel /> },
      { path: "calendar", element: <CalendarView /> },
      { path: "audit", element: <AuditList /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
