import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  Plus,
  Building2,
  FolderKanban,
  User,
  Trash2,
  Edit,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskProjectStore } from "@/store/useTaskProjectStore";
import { useClientStore } from "@/store/useClientStore";
import { TaskForm } from "./TaskForm";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
} from "@/lib/projectTemplates";

export default function TaskBoard() {
  const { t } = useTranslation();
  const {
    tasks,
    projects,
    users,
    loadData,
    saveTaskData,
    changeTaskStatus,
    removeTask,
    filterPriority,
    filterAssignee,
    filterProject,
    setFilterPriority,
    setFilterAssignee,
    setFilterProject,
  } = useTaskProjectStore();

  const { clients, loadClients } = useClientStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<string>("todo");

  useEffect(() => {
    loadData();
    loadClients();
  }, [loadData, loadClients]);

  const handleCreateInStatus = (status: string) => {
    setEditingTask(null);
    setTargetStatus(status);
    setFormOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee =
      filterAssignee === "all" || task.assignedTo === filterAssignee;
    const matchesProject =
      filterProject === "all" || task.projectId === filterProject;

    return matchesPriority && matchesAssignee && matchesProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            {t("task.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kanban workflow board with team assignment, priorities, and client linking.
          </p>
        </div>

        <Button
          onClick={() => handleCreateInStatus("todo")}
          size="sm"
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t("task.new")}
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 flex-wrap bg-card/40 p-2.5 rounded-lg border border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Priority Filter */}
        <select
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground focus:text-foreground shadow-sm"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground focus:text-foreground shadow-sm"
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
        >
          <option value="all">All Team Members</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Project Filter */}
        <select
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground focus:text-foreground shadow-sm"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {(filterPriority !== "all" ||
          filterAssignee !== "all" ||
          filterProject !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setFilterPriority("all");
              setFilterAssignee("all");
              setFilterProject("all");
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {TASK_STATUSES.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.value);

          return (
            <div
              key={column.value}
              className="flex flex-col bg-secondary/20 rounded-xl border border-border/60 p-3 min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-foreground tracking-wide uppercase">
                    {column.label}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                    {colTasks.length}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCreateInStatus(column.value)}
                  title={`Add task to ${column.label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Task Cards */}
              <div className="space-y-2.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-24 border border-dashed border-border/40 rounded-lg text-muted-foreground/40 text-[11px]">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const priorityObj =
                      TASK_PRIORITIES.find((p) => p.value === task.priority) ||
                      TASK_PRIORITIES[1];

                    // Find next and prev status for quick column navigation
                    const curIdx = TASK_STATUSES.findIndex(
                      (s) => s.value === task.status
                    );
                    const nextStatus = TASK_STATUSES[curIdx + 1]?.value;
                    const prevStatus = TASK_STATUSES[curIdx - 1]?.value;

                    return (
                      <Card
                        key={task.id}
                        className="border-border/60 hover:border-border transition-all bg-card shadow-xs group"
                      >
                        <CardContent className="p-3 space-y-2">
                          {/* Priority & Quick Actions */}
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${priorityObj.color}`}
                            >
                              {priorityObj.label}
                            </Badge>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                onClick={() => removeTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <p className="text-xs font-medium text-foreground leading-snug">
                            {task.title}
                          </p>

                          {/* Context: Project & Client */}
                          {(task.projectName || task.clientName || task.dueDate) && (
                            <div className="space-y-0.5 pt-1 text-[10px] text-muted-foreground">
                              {task.projectName && (
                                <div className="flex items-center gap-1 truncate text-primary/80">
                                  <FolderKanban className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{task.projectName}</span>
                                </div>
                              )}
                              {task.clientName && (
                                <div className="flex items-center gap-1 truncate">
                                  <Building2 className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{task.clientName}</span>
                                </div>
                              )}
                              {task.dueDate && task.dueDate > 0 && (
                                <div className="flex items-center gap-1 text-amber-400/90 font-mono text-[9px] pt-0.5">
                                  <Clock className="h-2.5 w-2.5 shrink-0" />
                                  <span>{formatDate(task.dueDate, "dd/MM/yyyy HH:mm")}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bottom Row: Assignee & Stage Transfer buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {task.assigneeName ? (
                                <span className="inline-flex items-center gap-1 bg-secondary/80 px-1.5 py-0.5 rounded text-[9px] text-foreground">
                                  <User className="h-2.5 w-2.5" />
                                  {task.assigneeName}
                                </span>
                              ) : (
                                <span className="opacity-40">Unassigned</span>
                              )}
                            </div>

                            {/* Move forward/back arrows */}
                            <div className="flex items-center gap-1">
                              {prevStatus && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeTaskStatus(task.id, prevStatus)
                                  }
                                  className="px-1 text-[10px] text-muted-foreground hover:text-foreground rounded hover:bg-secondary"
                                  title={`Move to ${prevStatus}`}
                                >
                                  ←
                                </button>
                              )}
                              {nextStatus && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    changeTaskStatus(task.id, nextStatus)
                                  }
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                                  title={`Move to ${nextStatus}`}
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        projects={projects}
        users={users}
        initialData={editingTask}
        defaultStatus={targetStatus}
        onSave={async (data) => {
          await saveTaskData(data);
        }}
      />
    </div>
  );
}
