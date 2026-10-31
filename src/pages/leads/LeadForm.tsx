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
import type { UpsertLeadInput, DecisionMakerItem } from "@/services/lead/leadService";

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
  const [linkedin, setLinkedin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [decisionMakerRole, setDecisionMakerRole] = useState("");
  const [notes, setNotes] = useState("");
  const [decisionMakers, setDecisionMakers] = useState<DecisionMakerItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDecisionMaker = () => {
    setDecisionMakers((prev) => [
      ...prev,
      { name: "", role: "", email: "", phone: "" },
    ]);
  };

  const handleRemoveDecisionMaker = (index: number) => {
    setDecisionMakers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const allDms: DecisionMakerItem[] = [];
      if (decisionMaker.trim()) {
        allDms.push({
          name: decisionMaker.trim(),
          role: decisionMakerRole.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      }
      for (const dm of decisionMakers) {
        if (dm.name.trim()) {
          allDms.push({
            name: dm.name.trim(),
            role: dm.role?.trim() || undefined,
            email: dm.email?.trim() || undefined,
            phone: dm.phone?.trim() || undefined,
          });
        }
      }

      await onSave({
        companyName: companyName.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        companySize,
        linkedin: linkedin.trim() || undefined,
        email: email.trim() || allDms[0]?.email || undefined,
        phone: phone.trim() || allDms[0]?.phone || undefined,
        decisionMaker: decisionMaker.trim() || allDms[0]?.name || undefined,
        decisionMakerRole: decisionMakerRole.trim() || allDms[0]?.role || undefined,
        decisionMakersList: allDms,
        notes: notes.trim() || undefined,
        source: "Manual Entry",
        stage: "discovered",
      });
      setCompanyName("");
      setWebsite("");
      setIndustry("");
      setLinkedin("");
      setEmail("");
      setPhone("");
      setDecisionMaker("");
      setDecisionMakerRole("");
      setDecisionMakers([]);
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Website</label>
              <Input
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Company LinkedIn</label>
              <Input
                placeholder="https://linkedin.com/company/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
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

          {/* Primary Decision Maker */}
          <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 space-y-2">
            <span className="font-semibold text-foreground block">
              Primary Decision Maker Contact
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Contact Name</label>
                <Input
                  placeholder="e.g. Alex Vance"
                  value={decisionMaker}
                  onChange={(e) => setDecisionMaker(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Role / Title</label>
                <Input
                  placeholder="e.g. CTO, CEO, VP Tech"
                  value={decisionMakerRole}
                  onChange={(e) => setDecisionMakerRole(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Phone / WhatsApp</label>
                <Input
                  placeholder="+213... or +1..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Multiple Decision Makers Section */}
          <div className="space-y-2 pt-1 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">
                Additional Decision Makers / Roles ({decisionMakers.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={handleAddDecisionMaker}
              >
                + Add Decision Maker
              </Button>
            </div>

            {decisionMakers.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {decisionMakers.map((dm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 grid grid-cols-1 sm:grid-cols-4 gap-2 relative"
                  >
                    <Input
                      placeholder="Name *"
                      value={dm.name}
                      onChange={(e) => {
                        const copy = [...decisionMakers];
                        copy[idx].name = e.target.value;
                        setDecisionMakers(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Role (e.g. COO)"
                      value={dm.role || ""}
                      onChange={(e) => {
                        const copy = [...decisionMakers];
                        copy[idx].role = e.target.value;
                        setDecisionMakers(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Email"
                      value={dm.email || ""}
                      onChange={(e) => {
                        const copy = [...decisionMakers];
                        copy[idx].email = e.target.value;
                        setDecisionMakers(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="Phone"
                        value={dm.phone || ""}
                        onChange={(e) => {
                          const copy = [...decisionMakers];
                          copy[idx].phone = e.target.value;
                          setDecisionMakers(copy);
                        }}
                        className="h-7 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDecisionMaker(idx)}
                        className="text-muted-foreground hover:text-destructive px-1.5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Notes</label>
            <Input
              placeholder="Pain points, observations, source..."
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
              {isSubmitting ? "Saving..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
