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
import type { UpsertLeadInput } from "@/services/lead/leadService";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpsertLeadInput) => Promise<void>;
}

export function LeadForm({ open, onOpenChange, onSave }: LeadFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("1-10");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [decisionMakerRole, setDecisionMakerRole] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        companyName: companyName.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        companySize,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        decisionMaker: decisionMaker.trim() || undefined,
        decisionMakerRole: decisionMakerRole.trim() || undefined,
        notes: notes.trim() || undefined,
        source: "Manual Entry",
        stage: "discovered",
      });
      setCompanyName("");
      setWebsite("");
      setEmail("");
      setPhone("");
      setDecisionMaker("");
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
          <DialogTitle>Add Potential Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Company Name *
            </label>
            <Input
              required
              placeholder="e.g. Acme Tech Solutions"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Website</label>
            <Input
              placeholder="https://company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Industry</label>
              <Input
                placeholder="Fintech, SaaS, Retail..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Company Size
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="1-10">1-10 (Small / Agile)</option>
                <option value="11-50">11-50 (Growing SME)</option>
                <option value="51-200">51-200 (Mid-Market)</option>
                <option value="200+">200+ (Enterprise)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Phone</label>
              <Input
                placeholder="+213..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Decision Maker Name
              </label>
              <Input
                placeholder="Founder / CTO name"
                value={decisionMaker}
                onChange={(e) => setDecisionMaker(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Role</label>
              <Input
                placeholder="CEO, Head of Tech..."
                value={decisionMakerRole}
                onChange={(e) => setDecisionMakerRole(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Notes</label>
            <Input
              placeholder="Initial observations or leads source..."
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
              {isSubmitting ? "Adding..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
