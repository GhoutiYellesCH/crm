import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Plus,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  FolderOpen,
  FileText,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuditStore } from "@/store/useAuditStore";
import { useClientStore } from "@/store/useClientStore";
import { AuditForm } from "./AuditForm";
import { AuditSessionDetail } from "./AuditSessionDetail";
import { AUDIT_LEVELS, SEVERITIES } from "@/lib/auditTemplates";
import { formatDate } from "@/lib/utils";

export default function AuditList() {
  const { t } = useTranslation();
  const {
    sessions,
    selectedSession,
    isLoading,
    loadSessions,
    selectSession,
    saveSessionData,
    removeSession,
    addFindingToSession,
    toggleAuditChecklistItem,
  } = useAuditStore();

  const { clients, loadClients } = useClientStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadSessions();
    loadClients();
  }, [loadSessions, loadClients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {t("audit.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conduct 3-level security audits (Black Box, User, Admin), document vulnerabilities, and generate PDF audit reports.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 shadow-sm"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("audit.new")}
        </Button>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Audit Sessions List */}
        <div className={`${selectedSession ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-10">
                Loading audit sessions...
              </p>
            ) : sessions.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No audit sessions active</p>
                <p className="text-xs mt-1 opacity-70">
                  Initialize an audit session to begin logging scope tests and vulnerabilities.
                </p>
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = selectedSession?.id === sess.id;
                const levelObj =
                  AUDIT_LEVELS.find((l) => l.value === sess.level) || AUDIT_LEVELS[0];

                const critCount = sess.parsedFindings.filter(
                  (f) => f.severity === "critical"
                ).length;
                const highCount = sess.parsedFindings.filter(
                  (f) => f.severity === "high"
                ).length;

                return (
                  <Card
                    key={sess.id}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-border hover:bg-card/80"
                    }`}
                    onClick={() => selectSession(sess.id)}
                  >
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {sess.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${levelObj.badge}`}
                            >
                              {levelObj.label.split(" ")[0]}
                            </Badge>
                          </div>

                          {sess.clientName && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{sess.clientName}</span>
                              {sess.clientCompany && <span>• {sess.clientCompany}</span>}
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                            <span>Started {formatDate(sess.startedAt)}</span>
                            {sess.parsedFindings.length > 0 ? (
                              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                                <Bug className="h-3 w-3" />
                                {sess.parsedFindings.length} finding(s)
                                {critCount > 0 && ` (${critCount} crit)`}
                              </span>
                            ) : (
                              <span>0 findings</span>
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

        {/* Right: Selected Audit Session Details */}
        {selectedSession ? (
          <div className="lg:col-span-7">
            <AuditSessionDetail
              session={selectedSession}
              onAddFinding={(finding) =>
                addFindingToSession(selectedSession.id, finding)
              }
              onToggleChecklist={(level, itemId) =>
                toggleAuditChecklistItem(selectedSession.id, level, itemId)
              }
              onDeleteSession={() => removeSession(selectedSession.id)}
            />
          </div>
        ) : (
          sessions.length > 0 && (
            <div className="hidden lg:flex lg:col-span-7 items-center justify-center border border-dashed rounded-lg p-12 text-muted-foreground">
              <div className="text-center space-y-2">
                <FolderOpen className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">Select an audit session</p>
                <p className="text-xs opacity-70">
                  Track tests across Black Box, User, and Admin checklists and export the executive report.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <AuditForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        onSave={async (data) => {
          await saveSessionData(data);
        }}
      />
    </div>
  );
}
