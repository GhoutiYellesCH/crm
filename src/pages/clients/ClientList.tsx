import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useClientStore } from "@/store/useClientStore";
import { ClientForm } from "./ClientForm";
import { ClientDetail } from "./ClientDetail";
import { CLIENT_STATUSES, SERVICES_CATALOG } from "@/lib/servicesCatalog";
import { formatDate } from "@/lib/utils";

export default function ClientList() {
  const { t } = useTranslation();
  const {
    clients,
    selectedClient,
    isLoading,
    searchQuery,
    selectedStatus,
    selectedServiceTag,
    loadClients,
    selectClient,
    saveClientData,
    removeClient,
    addContact,
    removeContact,
    addNote,
    removeNote,
    setSearchQuery,
    setSelectedStatus,
    setSelectedServiceTag,
  } = useClientStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Filtering
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.country && c.country.toLowerCase().includes(q));

    const matchesStatus =
      selectedStatus === "all" || c.status === selectedStatus;

    const matchesTag =
      selectedServiceTag === "all" ||
      c.parsedTags.includes(selectedServiceTag);

    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleCreateNew = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t("client.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your client accounts, stakeholder contacts, and service requirements.
          </p>
        </div>

        <Button onClick={handleCreateNew} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          {t("client.new")}
        </Button>
      </div>

      {/* Main Content Layout: Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters & Client List */}
        <div className={`${selectedClient ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, email, location..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <select
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground focus:text-foreground shadow-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses ({clients.length})</option>
                {CLIENT_STATUSES.map((st) => {
                  const count = clients.filter((c) => c.status === st.value).length;
                  return (
                    <option key={st.value} value={st.value}>
                      {st.label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* Service filter */}
              <select
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-muted-foreground focus:text-foreground shadow-sm"
                value={selectedServiceTag}
                onChange={(e) => setSelectedServiceTag(e.target.value)}
              >
                <option value="all">All Services</option>
                {SERVICES_CATALOG.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.category === "solo" ? "[Solo] " : "[Team] "}
                    {srv.shortLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Clients */}
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-10">
                Loading clients...
              </p>
            ) : filteredClients.length === 0 ? (
              <div className="border border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm font-medium">No clients found</p>
                <p className="text-xs mt-1 opacity-70">
                  {searchQuery || selectedStatus !== "all" || selectedServiceTag !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first client above"}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                const statusObj =
                  CLIENT_STATUSES.find((s) => s.value === client.status) || CLIENT_STATUSES[0];

                return (
                  <Card
                    key={client.id}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-border hover:bg-card/80"
                    }`}
                    onClick={() => selectClient(client.id)}
                  >
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate text-foreground">
                              {client.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${statusObj.color}`}
                            >
                              {statusObj.label}
                            </Badge>
                          </div>

                          {client.company && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{client.company}</span>
                              {client.industry && <span className="opacity-60">• {client.industry}</span>}
                            </div>
                          )}

                          {/* Location & Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {client.parsedTags.slice(0, 3).map((tagId) => {
                              const s = SERVICES_CATALOG.find((x) => x.id === tagId);
                              if (!s) return null;
                              return (
                                <span
                                  key={tagId}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground"
                                >
                                  {s.shortLabel}
                                </span>
                              );
                            })}
                            {client.parsedTags.length > 3 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{client.parsedTags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/40"
                          }`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Client Detail Pane */}
        {selectedClient ? (
          <div className="lg:col-span-7">
            <ClientDetail
              client={selectedClient}
              onEdit={() => handleEdit(selectedClient)}
              onDelete={() => removeClient(selectedClient.id)}
              onAddNote={(content) => addNote(selectedClient.id, content)}
              onDeleteNote={(noteId) => removeNote(noteId, selectedClient.id)}
              onAddContact={(contact) => addContact(selectedClient.id, contact)}
              onDeleteContact={(contactId) => removeContact(contactId, selectedClient.id)}
            />
          </div>
        ) : (
          filteredClients.length > 0 && (
            <div className="hidden lg:flex lg:col-span-7 items-center justify-center border border-dashed rounded-lg p-12 text-muted-foreground">
              <div className="text-center space-y-2">
                <FolderOpen className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">Select a client to view full details</p>
                <p className="text-xs opacity-70">
                  Inspect contacts, interaction logs, notes, and tagged services.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Create / Edit Dialog */}
      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingClient}
        onSave={async (data) => {
          await saveClientData(data);
        }}
      />
    </div>
  );
}
