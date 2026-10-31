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
import { SERVICES_CATALOG, CLIENT_STATUSES } from "@/lib/servicesCatalog";
import { CURRENCIES } from "@/lib/utils";
import type { ClientWithDetails, UpsertClientInput } from "@/services/clientService";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ClientWithDetails | null;
  onSave: (data: UpsertClientInput) => Promise<void>;
}

export function ClientForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: ClientFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("1-10");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [status, setStatus] = useState("lead");
  const [currency, setCurrency] = useState("DZD");
  const [notes, setNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [extraContacts, setExtraContacts] = useState<
    { name: string; role: string; email: string; phone: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCompany(initialData.company || "");
      setIndustry(initialData.industry || "");
      setCompanySize(initialData.companySize || "1-10");
      setCountry(initialData.country || "");
      setCity(initialData.city || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setWebsite(initialData.website || "");
      setLinkedin(initialData.linkedin || "");
      setInstagram(initialData.instagram || "");
      setFacebook(initialData.facebook || "");
      setStatus(initialData.status || "lead");
      setCurrency(initialData.currency || "DZD");
      setNotes(initialData.notes || "");
      setSelectedServices(initialData.parsedTags || []);
      setExtraContacts(
        (initialData.contacts || []).map((c) => ({
          name: c.name || "",
          role: c.role || "",
          email: c.email || "",
          phone: c.phone || "",
        }))
      );
    } else {
      setName("");
      setCompany("");
      setIndustry("");
      setCompanySize("1-10");
      setCountry("");
      setCity("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setLinkedin("");
      setInstagram("");
      setFacebook("");
      setStatus("lead");
      setCurrency("DZD");
      setNotes("");
      setSelectedServices([]);
      setExtraContacts([]);
    }
  }, [initialData, open]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        company: company.trim() || undefined,
        industry: industry.trim() || undefined,
        companySize,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        status,
        currency,
        notes: notes.trim() || undefined,
        serviceTags: selectedServices,
        contactsList: extraContacts.filter((c) => c.name.trim().length > 0),
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Save client error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Client Profile" : "Create New Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Client / Contact Name *
              </label>
              <Input
                required
                placeholder="e.g. John Doe or Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Company Name
              </label>
              <Input
                placeholder="e.g. Acme Agency LLC"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Pipeline Status
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {CLIENT_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Preferred Currency
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.symbol} {cur.code} - {cur.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="contact@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Phone / WhatsApp
              </label>
              <Input
                placeholder="+213... or +33..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Website
              </label>
              <Input
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                LinkedIn Profile
              </label>
              <Input
                placeholder="https://linkedin.com/in/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Instagram
              </label>
              <Input
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Facebook
              </label>
              <Input
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>
          </div>

          {/* Multiple Contacts / Team Members Section */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Multiple Contact Persons / Decision Makers ({extraContacts.length})</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() =>
                  setExtraContacts((prev) => [
                    ...prev,
                    { name: "", role: "", email: "", phone: "" },
                  ])
                }
              >
                + Add Contact Person
              </Button>
            </div>

            {extraContacts.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {extraContacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 grid grid-cols-1 sm:grid-cols-4 gap-2 relative"
                  >
                    <Input
                      placeholder="Full Name *"
                      value={c.name}
                      onChange={(e) => {
                        const copy = [...extraContacts];
                        copy[idx].name = e.target.value;
                        setExtraContacts(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Role / Title (e.g. CTO)"
                      value={c.role}
                      onChange={(e) => {
                        const copy = [...extraContacts];
                        copy[idx].role = e.target.value;
                        setExtraContacts(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <Input
                      placeholder="Email"
                      value={c.email}
                      onChange={(e) => {
                        const copy = [...extraContacts];
                        copy[idx].email = e.target.value;
                        setExtraContacts(copy);
                      }}
                      className="h-7 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        placeholder="Phone / WhatsApp"
                        value={c.phone}
                        onChange={(e) => {
                          const copy = [...extraContacts];
                          copy[idx].phone = e.target.value;
                          setExtraContacts(copy);
                        }}
                        className="h-7 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExtraContacts((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
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

          {/* Business & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Industry
              </label>
              <Input
                placeholder="E-commerce, SaaS, Med..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Country
              </label>
              <Input
                placeholder="Algeria, France, US..."
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                City
              </label>
              <Input
                placeholder="Algiers, Paris, London..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* Services Checklist / Tags */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-semibold text-muted-foreground block">
              Interested Services (Solo & Team)
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICES_CATALOG.map((srv) => {
                const isSelected = selectedServices.includes(srv.id);
                return (
                  <Badge
                    key={srv.id}
                    variant="outline"
                    className={`cursor-pointer text-xs px-2.5 py-1 transition-all ${
                      isSelected
                        ? `${srv.color} font-semibold ring-1 ring-primary`
                        : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => toggleService(srv.id)}
                  >
                    {srv.category === "solo" ? "👤 " : "👥 "}
                    {srv.shortLabel}
                    {isSelected && " ✓"}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Initial Notes */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Internal Notes / Requirements
            </label>
            <textarea
              className="w-full min-h-[70px] rounded-md border border-input bg-background p-2 text-sm shadow-sm"
              placeholder="Context about their pain points, what service they asked for, next steps..."
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
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
