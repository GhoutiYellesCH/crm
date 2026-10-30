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
import { EVENT_TYPES } from "@/services/calendarService";
import { toUnix } from "@/lib/utils";
import type { CalendarEventWithDetails, UpsertEventInput } from "@/services/calendarService";
import type { ClientWithDetails } from "@/services/clientService";
import type { TaskWithDetails } from "@/services/taskService";
import type { LeadWithDetails } from "@/services/lead/leadService";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientWithDetails[];
  tasks: TaskWithDetails[];
  leads: LeadWithDetails[];
  initialData?: CalendarEventWithDetails | null;
  defaultDate?: Date;
  onSave: (data: UpsertEventInput) => Promise<void>;
}

export function EventForm({
  open,
  onOpenChange,
  clients,
  tasks,
  leads,
  initialData,
  defaultDate = new Date(),
  onSave,
}: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("meeting");
  const [startDateStr, setStartDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [clientId, setClientId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setType(initialData.type || "meeting");
      setClientId(initialData.clientId || "");
      setTaskId(initialData.taskId || "");
      setLeadId(initialData.leadId || "");

      const d = new Date(initialData.startAt * 1000);
      setStartDateStr(d.toISOString().slice(0, 10));
      setStartTimeStr(d.toTimeString().slice(0, 5));
      const dur = Math.round((initialData.endAt - initialData.startAt) / 60);
      setDurationMinutes(dur > 0 ? dur : 45);
    } else {
      setTitle("");
      setDescription("");
      setType("meeting");
      setClientId("");
      setTaskId("");
      setLeadId("");
      setStartDateStr(defaultDate.toISOString().slice(0, 10));
      setStartTimeStr("10:00");
      setDurationMinutes(45);
    }
  }, [initialData, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDateStr) return;

    setIsSubmitting(true);
    try {
      const [year, month, day] = startDateStr.split("-").map(Number);
      const [hours, minutes] = startTimeStr.split(":").map(Number);
      const startObj = new Date(year, month - 1, day, hours, minutes);
      const startAt = toUnix(startObj);
      const endAt = startAt + durationMinutes * 60;

      await onSave({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startAt,
        endAt,
        clientId: clientId || undefined,
        taskId: taskId || undefined,
        leadId: leadId || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Calendar Event" : "Schedule Workflow Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Event Title *
            </label>
            <Input
              required
              placeholder="e.g. Security Audit Kickoff Call or Project Demo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Event Type</label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Date *</label>
              <Input
                type="date"
                required
                className="h-8 text-xs"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Time</label>
              <Input
                type="time"
                className="h-8 text-xs"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Duration</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Context Links */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Linked Client
              </label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
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

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Linked Lead
              </label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
              >
                <option value="">None</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Agenda / Meeting Notes
            </label>
            <textarea
              className="w-full min-h-[50px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
              placeholder="Zoom / Google Meet link, discussion points..."
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
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Schedule Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
