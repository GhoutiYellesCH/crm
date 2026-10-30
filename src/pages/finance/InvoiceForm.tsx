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
import { Trash2, Plus } from "lucide-react";
import { CURRENCIES, generateId, formatCurrency } from "@/lib/utils";
import type { InvoiceItem } from "@/services/pdf/invoicePdf";
import type { InvoiceWithDetails, UpsertInvoiceInput } from "@/services/financeService";
import type { ClientWithDetails } from "@/services/clientService";
import type { ProjectWithDetails } from "@/services/taskService";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientWithDetails[];
  projects: ProjectWithDetails[];
  initialData?: InvoiceWithDetails | null;
  onSave: (data: UpsertInvoiceInput) => Promise<void>;
}

export function InvoiceForm({
  open,
  onOpenChange,
  clients,
  projects,
  initialData,
  onSave,
}: InvoiceFormProps) {
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [number, setNumber] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [status, setStatus] = useState("draft");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId);
      setProjectId(initialData.projectId || "");
      setNumber(initialData.number);
      setCurrency(initialData.currency);
      setStatus(initialData.status);
      setTaxRate(initialData.taxRate || 0);
      setDiscount(initialData.discount || 0);
      setNotes(initialData.notes || "");
      setItems(initialData.parsedItems || []);
    } else {
      setClientId("");
      setProjectId("");
      // Generate default invoice number e.g. INV-2026-101
      const rand = Math.floor(100 + Math.random() * 900);
      setNumber(`INV-${new Date().getFullYear()}-${rand}`);
      setCurrency("EUR");
      setStatus("draft");
      setTaxRate(0);
      setDiscount(0);
      setNotes("Payment due within 14 days via Bank Transfer. Thank you for your business!");
      setItems([
        {
          id: generateId(),
          description: "Service Implementation",
          quantity: 1,
          unitPrice: 500,
          total: 500,
        },
      ]);
    }
  }, [initialData, open]);

  // Handle client selection (auto-sync currency from client)
  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const cl = clients.find((c) => c.id === cId);
    if (cl?.currency) {
      setCurrency(cl.currency);
    }
  };

  const handleItemChange = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "quantity" || field === "unitPrice") {
          const q = field === "quantity" ? Number(val) || 0 : item.quantity;
          const p = field === "unitPrice" ? Number(val) || 0 : item.unitPrice;
          updated.total = q * p;
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: generateId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert("Please select a client.");
      return;
    }
    if (!number.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        clientId,
        projectId: projectId || undefined,
        number: number.trim(),
        status,
        currency,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? `Edit Invoice #${initialData.number}` : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Client, Number, Currency & Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Client *
              </label>
              <select
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                <option value="">Select a Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Invoice Number *
              </label>
              <Input
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Currency
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.symbol} {cur.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Linked Project (Optional)
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Status
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Line Items
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-secondary/20 p-2 rounded-md border border-border/40"
                >
                  <div className="col-span-6">
                    <Input
                      placeholder="Item / service description..."
                      className="h-8 text-xs"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="h-8 text-xs"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Price"
                      className="h-8 text-xs"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, "unitPrice", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between pl-1">
                    <span className="text-xs font-semibold truncate">
                      {formatCurrency(item.total, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discount, Totals Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Tax / VAT Rate (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="h-8 text-xs"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Discount ({currency})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    className="h-8 text-xs"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Payment Instructions / Notes
                </label>
                <textarea
                  className="w-full min-h-[50px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Total Box */}
            <div className="bg-card p-3 rounded-lg border border-border/60 flex flex-col justify-center space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({taxRate}%):</span>
                  <span>+{formatCurrency(taxAmount, currency)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/40">
                <span>TOTAL:</span>
                <span className="text-primary text-base font-extrabold">
                  {formatCurrency(total, currency)}
                </span>
              </div>
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
              {isSubmitting ? "Saving..." : initialData ? "Save Invoice" : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
