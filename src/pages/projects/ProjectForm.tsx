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
import { Badge } from "@/components/ui/badge";
import {
  SERVICE_PROJECT_TEMPLATES,
  type ChecklistItem,
} from "@/lib/projectTemplates";
import { SERVICES_CATALOG } from "@/lib/servicesCatalog";
import { generateId } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import { useUIStore } from "@/store/useUIStore";
import type { ProjectWithDetails, UpsertProjectInput } from "@/services/taskService";
import type { ClientWithDetails } from "@/services/clientService";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientWithDetails[];
  initialData?: ProjectWithDetails | null;
  onSave: (data: UpsertProjectInput) => Promise<void>;
}

export function ProjectForm({
  open,
  onOpenChange,
  clients,
  initialData,
  onSave,
}: ProjectFormProps) {
  const { mainCurrency } = useUIStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("ai_automation");
  const [status, setStatus] = useState<string>("active");
  const [price, setPrice] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [currency, setCurrency] = useState<string>(mainCurrency || "DZD");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [customItemText, setCustomItemText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setClientId(initialData.clientId || "");
      setServiceType(initialData.serviceType || "ai_automation");
      setStatus(initialData.status || "active");
      setPrice(initialData.price ?? 0);
      setExpenses(initialData.expenses ?? 0);
      setCurrency(initialData.currency || mainCurrency || "DZD");
      setChecklist(initialData.parsedChecklist || []);
    } else {
      setName("");
      setDescription("");
      setClientId("");
      setServiceType("ai_automation");
      setStatus("active");
      setPrice(0);
      setExpenses(0);
      setCurrency(mainCurrency || "DZD");
      // Load default checklist for default service type
      const def = SERVICE_PROJECT_TEMPLATES["ai_automation"]?.defaultChecklist || [];
      setChecklist(def.map((text) => ({ id: generateId(), text, done: false })));
    }
  }, [initialData, mainCurrency, open]);

  // When changing service type in creation mode, prompt to load corresponding checklist
  const handleServiceTypeChange = (newType: string) => {
    setServiceType(newType);
    if (!initialData) {
      const template = SERVICE_PROJECT_TEMPLATES[newType];
      if (template) {
        setChecklist(
          template.defaultChecklist.map((text) => ({
            id: generateId(),
            text,
            done: false,
          }))
        );
      }
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemText.trim()) return;
    setChecklist([
      ...checklist,
      { id: generateId(), text: customItemText.trim(), done: false },
    ]);
    setCustomItemText("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        description: description.trim() || undefined,
        clientId: clientId || undefined,
        serviceType,
        status,
        price,
        expenses,
        currency,
        checklist,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Project" : "New Project from Checklist Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Project Name *
              </label>
              <Input
                required
                placeholder="e.g. AI Customer Support Bot or Pentest Acme Q4"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Service Type (Loads Checklist)
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
              >
                {SERVICES_CATALOG.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.category === "solo" ? "👤 [Solo] " : "👥 [Team] "}
                    {srv.label}
                  </option>
                ))}
                <option value="other">Custom Project</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Client Linked
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">No Client (Internal Project)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financials: Price, Expenses, Currency & Projected Net Profit */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2">
            <span className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Project Financials & Deliverable Budget</span>
              <span className="text-[11px] text-emerald-400 font-bold">
                Projected Profit: {price - expenses >= 0 ? "+" : ""}{(price - expenses).toFixed(2)} {currency}
              </span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Project Total Price *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 1500"
                  value={price || ""}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Estimated Expenses
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 300 (tools, team, ads)"
                  value={expenses || ""}
                  onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-semibold text-rose-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold shadow-sm"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Description / Deliverables
            </label>
            <textarea
              className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm shadow-sm"
              placeholder="Scope summary, targets, milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Checklist Milestones */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Service Checklist Milestones ({checklist.length} items)
              </label>
              <span className="text-[10px] text-muted-foreground">
                Auto-populated from service template
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/30 border border-border/40 text-xs"
                >
                  <span className="font-medium text-muted-foreground">#{idx + 1}</span>
                  <span className="flex-1 truncate">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-muted-foreground hover:text-destructive px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add custom checklist item..."
                className="h-8 text-xs"
                value={customItemText}
                onChange={(e) => setCustomItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem(e);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleAddChecklistItem}
              >
                Add Item
              </Button>
            </div>
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
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
