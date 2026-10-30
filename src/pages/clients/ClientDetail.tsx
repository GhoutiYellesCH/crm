import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  StickyNote,
  UserCheck,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SERVICES_CATALOG, CLIENT_STATUSES } from "@/lib/servicesCatalog";
import { formatDate } from "@/lib/utils";
import type { ClientWithDetails } from "@/services/clientService";

interface ClientDetailProps {
  client: ClientWithDetails;
  onEdit: () => void;
  onDelete: () => void;
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onAddContact: (contact: { name: string; role?: string; email?: string; phone?: string; linkedin?: string; isPrimary?: boolean }) => Promise<void>;
  onDeleteContact: (contactId: string) => Promise<void>;
}

export function ClientDetail({
  client,
  onEdit,
  onDelete,
  onAddNote,
  onDeleteNote,
  onAddContact,
  onDeleteContact,
}: ClientDetailProps) {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // New contact form toggle
  const [showContactForm, setShowContactForm] = useState(false);
  const [cName, setCName] = useState("");
  const [cRole, setCRole] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");

  const statusObj = CLIENT_STATUSES.find((s) => s.value === client.status) || CLIENT_STATUSES[0];

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote("");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;
    await onAddContact({
      name: cName.trim(),
      role: cRole.trim() || undefined,
      email: cEmail.trim() || undefined,
      phone: cPhone.trim() || undefined,
    });
    setCName("");
    setCRole("");
    setCEmail("");
    setCPhone("");
    setShowContactForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {client.name}
                </h2>
                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${statusObj.color}`}>
                  {statusObj.label}
                </Badge>
                {client.currency && (
                  <Badge variant="secondary" className="text-xs">
                    {client.currency}
                  </Badge>
                )}
              </div>

              {client.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  <span>{client.company}</span>
                  {client.industry && <span>• {client.industry}</span>}
                  {client.companySize && <span>({client.companySize} people)</span>}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                {(client.city || client.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[client.city, client.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Added {formatDate(client.createdAt)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start">
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-8">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                    onDelete();
                  }
                }}
                className="gap-1.5 h-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Quick Communication bar */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40 flex-wrap">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                {client.email}
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                {client.phone}
              </a>
            )}
            {client.website && (
              <a
                href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                Website
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            )}
            {client.linkedin && (
              <a
                href={client.linkedin.startsWith("http") ? client.linkedin : `https://${client.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                LinkedIn
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            )}
          </div>

          {/* Services Tagged */}
          {client.parsedTags.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40">
              <span className="text-xs text-muted-foreground block mb-2 font-semibold">
                Interested Services:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {client.parsedTags.map((tId) => {
                  const srv = SERVICES_CATALOG.find((s) => s.id === tId);
                  if (!srv) return null;
                  return (
                    <Badge
                      key={tId}
                      variant="outline"
                      className={`text-xs px-2 py-0.5 ${srv.color}`}
                    >
                      {srv.category === "solo" ? "👤 " : "👥 "}
                      {srv.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section: Notes & Contacts */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="bg-secondary/40 border border-border/50">
          <TabsTrigger value="notes" className="gap-2 text-xs">
            <StickyNote className="h-3.5 w-3.5" />
            Notes & Logs ({client.notesList?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2 text-xs">
            <UserCheck className="h-3.5 w-3.5" />
            Team / Stakeholders ({client.contacts?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4 pt-2">
          {/* Add note card */}
          <Card>
            <CardContent className="p-3">
              <form onSubmit={handleCreateNote} className="space-y-2">
                <textarea
                  className="w-full min-h-[64px] rounded-md border border-input bg-background p-2 text-sm shadow-sm"
                  placeholder="Record an interaction, meeting notes, requirements, or reminder..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isAddingNote || !newNote.trim()}>
                    {isAddingNote ? "Adding..." : "Add Note"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Initial description if any */}
          {client.notes && (
            <Card className="bg-muted/20 border-border/40">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">General Profile Notes</p>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes list */}
          <div className="space-y-2">
            {client.notesList && client.notesList.length > 0 ? (
              client.notesList.map((n) => (
                <Card key={n.id} className="border-border/40">
                  <CardContent className="p-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{formatDate(n.createdAt, "dd/MM/yyyy HH:mm")}</p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onDeleteNote(n.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No notes recorded yet. Add your first note above.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Key contacts & decision makers for this company
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setShowContactForm(!showContactForm)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Contact
            </Button>
          </div>

          {showContactForm && (
            <Card className="border-primary/40 bg-card">
              <CardContent className="p-4">
                <form onSubmit={handleCreateContact} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Contact Name *"
                      required
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                    />
                    <Input
                      placeholder="Role (e.g. CTO, Marketing Lead)"
                      value={cRole}
                      onChange={(e) => setCRole(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Direct Phone"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowContactForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Save Contact
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {client.contacts && client.contacts.length > 0 ? (
              client.contacts.map((contact) => (
                <Card key={contact.id} className="border-border/50">
                  <CardContent className="p-3.5 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{contact.name}</span>
                        {contact.isPrimary === 1 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Primary
                          </Badge>
                        )}
                      </div>
                      {contact.role && (
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      )}
                      <div className="flex flex-col gap-0.5 pt-1 text-xs text-muted-foreground">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                            ✉️ {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                            📞 {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6 col-span-2">
                No individual contacts linked yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
