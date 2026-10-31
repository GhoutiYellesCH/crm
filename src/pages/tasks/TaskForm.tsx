import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/projectTemplates";
import type { TaskWithDetails, UpsertTaskInput, ProjectWithDetails } from "@/services/taskService";
import type { ClientWithDetails } from "@/services/clientService";
import type { User } from "@/db/schema";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientWithDetails[];
  projects: ProjectWithDetails[];
  users: User[];
  initialData?: TaskWithDetails | null;
  defaultStatus?: string;
  onSave: (data: UpsertTaskInput) => Promise<void>;
}

export function TaskForm({
  open,
  onOpenChange,
  clients,
  projects,
  users,
  initialData,
  defaultStatus = "todo",
  onSave,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "todo");
      setPriority(initialData.priority || "medium");
      setClientId(initialData.clientId || "");
      setProjectId(initialData.projectId || "");
      setAssignedTo(initialData.assignedTo || "");
      if (initialData.dueDate && initialData.dueDate > 0) {
        const d = new Date(initialData.dueDate * 1000);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        setDueDate(`${y}-${m}-${day}`);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        setDueTime(`${hh}:${mm}`);
      } else {
        setDueDate("");
        setDueTime("");
      }
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus);
      setPriority("medium");
      setClientId("");
      setProjectId("");
      setAssignedTo("");
      setDueDate("");
      setDueTime("");
    }
  }, [initialData, defaultStatus, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalTimestamp: number | null = null;
    if (dueDate) {
      const timePart = dueTime ? dueTime : "12:00";
      const d = new Date(`${dueDate}T${timePart}:00`);
      if (!isNaN(d.getTime())) {
        finalTimestamp = Math.floor(d.getTime() / 1000);
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        clientId: clientId || undefined,
        projectId: projectId || undefined,
        assignedTo: assignedTo || undefined,
        dueDate: finalTimestamp,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Task Title *
            </label>
            <Input
              required
              placeholder="e.g. Implement OAuth2 flow, shoot B-roll footage..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Status
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {TASK_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Priority
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {TASK_PRIORITIES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Task Time */}
          <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border/50">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                📅 Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                ⏰ Task Time (Scheduled Hour)
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Linked Project
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">None (Independent Task)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Linked Client
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Assigned Team Member
            </label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Description / Notes
            </label>
            <textarea
              className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm shadow-sm"
              placeholder="Task instructions, links, or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
