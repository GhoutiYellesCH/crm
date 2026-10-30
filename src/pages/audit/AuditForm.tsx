import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUDIT_LEVELS, AUDIT_CHECKLISTS_BY_LEVEL } from "@/lib/auditTemplates";
import { generateId } from "@/lib/utils";
import type { UpsertAuditInput } from "@/services/auditService";
import type { ClientWithDetails } from "@/services/clientService";

interface AuditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientWithDetails[];
  onSave: (data: UpsertAuditInput) => Promise<void>;
}

export function AuditForm({ open, onOpenChange, clients, onSave }: AuditFormProps) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [level, setLevel] = useState("full");
  const [scope, setScope] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // Build starter checklists for the chosen audit level
      const checklist: Record<string, any[]> = {};

      const populateLevel = (lvl: string) => {
        const raw = AUDIT_CHECKLISTS_BY_LEVEL[lvl] || [];
        return raw.map((item) => ({
          id: generateId(),
          category: item.category,
          item: item.item,
          done: false,
        }));
      };

      if (level === "full") {
        checklist["black_box"] = populateLevel("black_box");
        checklist["user"] = populateLevel("user");
        checklist["admin"] = populateLevel("admin");
      } else {
        checklist[level] = populateLevel(level);
      }

      await onSave({
        title: title.trim(),
        clientId: clientId || undefined,
        level,
        status: "in_progress",
        scope: scope.trim() || undefined,
        notes: notes.trim() || undefined,
        findings: [],
        checklist,
      });

      setTitle("");
      setClientId("");
      setScope("");
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Security Audit Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Audit Title *
            </label>
            <Input
              required
              placeholder="e.g. Q4 Web Application Pentest or Infra Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Client Target
            </label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Internal / Unlinked Audit</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Audit Scope Level
            </label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {AUDIT_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Target Scope & Rules of Engagement
            </label>
            <Input
              placeholder="e.g. *.company.com, 192.168.1.0/24 (Production exclusion)"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Engagement Notes
            </label>
            <textarea
              className="w-full min-h-[50px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
              placeholder="Client credentials, testing window dates..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {isSubmitting ? "Starting..." : "Initialize Audit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
