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
import { CURRENCIES } from "@/lib/utils";
import type { UpsertTransactionInput } from "@/services/financeService";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpsertTransactionInput) => Promise<void>;
}

export function ExpenseForm({ open, onOpenChange, onSave }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("software");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        type: "expense",
        category,
        currency,
        amount,
        description: description.trim(),
        notes: notes.trim() || undefined,
      });
      setDescription("");
      setAmount(0);
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
          <DialogTitle>Record Business Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Description *
            </label>
            <Input
              required
              placeholder="e.g. AWS Hosting, Domain renew, Camera lens rent..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Amount *
              </label>
              <Input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Category
            </label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="software">Software / SaaS / Subscriptions</option>
              <option value="hardware">Hardware / Equipment</option>
              <option value="hosting">Hosting & Cloud Infrastructure</option>
              <option value="travel">Travel & Logistics</option>
              <option value="team">Team Freelancer Payouts</option>
              <option value="marketing">Advertising & Marketing</option>
              <option value="other">Other Operational Costs</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Notes
            </label>
            <Input
              placeholder="Receipt details, reference number..."
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
              {isSubmitting ? "Saving..." : "Record Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
