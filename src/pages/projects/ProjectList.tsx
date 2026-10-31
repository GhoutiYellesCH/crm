import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderKanban,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskProjectStore } from "@/store/useTaskProjectStore";
import { useClientStore } from "@/store/useClientStore";
import { ProjectForm } from "./ProjectForm";
import { SERVICES_CATALOG } from "@/lib/servicesCatalog";
import { formatDate } from "@/lib/utils";
import { formatMoney } from "@/lib/currencies";
import { DollarSign } from "lucide-react";

export default function ProjectList() {
  const { t } = useTranslation();
  const {
    projects,
    selectedProject,
    loadData,
    selectProject,
    saveProjectData,
    removeProject,
    toggleChecklist,
  } = useTaskProjectStore();

  const { clients, loadClients } = useClientStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadClients();
  }, [loadData, loadClients]);

  const handleCreateNew = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            {t("project.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track active service deliveries with automated step-by-step milestone checklists.
          </p>
        </div>

        <Button onClick={handleCreateNew} size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          {t("project.new")}
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full border border-dashed rounded-lg p-12 text-center text-muted-foreground">
            <FolderKanban className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-xs mt-1 opacity-70">
              Create your first project from a service checklist template.
            </p>
          </div>
        ) : (
          projects.map((proj) => {
            const srv = SERVICES_CATALOG.find((s) => s.id === proj.serviceType);
            const totalItems = proj.parsedChecklist.length;
            const completedItems = proj.parsedChecklist.filter((i) => i.done).length;
            const progressPct =
              totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            return (
              <Card
                key={proj.id}
                className="border-border/60 hover:border-border transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          srv?.color || "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {srv ? `${srv.category === "solo" ? "👤 " : "👥 "}${srv.shortLabel}` : "Custom"}
                      </Badge>
                      <CardTitle className="text-base font-semibold truncate pt-1">
                        {proj.name}
                      </CardTitle>
                      {proj.clientName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3" />
                          {proj.clientName}
                          {proj.clientCompany && ` • ${proj.clientCompany}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(proj)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete project "${proj.name}"?`)) {
                            removeProject(proj.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {proj.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {proj.description}
                    </p>
                  )}

                  {/* Progress Bar & Status */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground">
                      <span>Checklist Progress</span>
                      <div className="flex items-center gap-1.5">
                        {progressPct === 100 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Done
                          </span>
                        )}
                        <span>
                          {completedItems} / {totalItems} ({progressPct}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          progressPct === 100 ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Financials: Price, Expenses, Profit */}
                  {((proj.price || 0) > 0 || (proj.expenses || 0) > 0) && (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded bg-secondary/25 border border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Price</span>
                        <span className="font-semibold text-foreground">
                          {formatMoney(proj.price || 0, proj.currency || "DZD")}
                        </span>
                      </div>
                      {(proj.expenses || 0) > 0 && (
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Expenses</span>
                          <span className="font-medium text-rose-400">
                            {formatMoney(proj.expenses || 0, proj.currency || "DZD")}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Net Profit</span>
                        <span
                          className={`font-bold ${
                            (proj.price || 0) - (proj.expenses || 0) >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatMoney(
                            (proj.price || 0) - (proj.expenses || 0),
                            proj.currency || "DZD"
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Checklist Items Preview */}
                  <div className="space-y-1.5 pt-1 border-t border-border/40 max-h-40 overflow-y-auto pr-1">
                    {proj.parsedChecklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklist(proj.id, item.id)}
                        className={`flex items-start gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                          item.done
                            ? "line-through text-muted-foreground/60 bg-secondary/20"
                            : "hover:bg-secondary/40 text-foreground"
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className="leading-tight">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                    <span>Started {formatDate(proj.createdAt)}</span>
                    {progressPct === 100 ? (
                      <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-2 py-0.5">
                        ✓ Done
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {proj.status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        initialData={editingProject}
        onSave={async (data) => {
          await saveProjectData(data);
        }}
      />
    </div>
  );
}
