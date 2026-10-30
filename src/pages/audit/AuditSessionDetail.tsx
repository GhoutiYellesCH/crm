import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  Trash2,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Bug,
  Server,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SEVERITIES, AUDIT_LEVELS } from "@/lib/auditTemplates";
import { generateAuditPdf } from "@/services/pdf/auditPdf";
import { downloadPdf } from "@/services/pdf/invoicePdf";
import { generateId, formatDate } from "@/lib/utils";
import type { AuditSessionWithDetails } from "@/services/auditService";
import type { Finding } from "@/services/pdf/auditPdf";

interface AuditSessionDetailProps {
  session: AuditSessionWithDetails;
  onAddFinding: (finding: Finding) => Promise<void>;
  onToggleChecklist: (level: string, itemId: string) => Promise<void>;
  onDeleteSession: () => void;
}

export function AuditSessionDetail({
  session,
  onAddFinding,
  onToggleChecklist,
  onDeleteSession,
}: AuditSessionDetailProps) {
  // Finding composer
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [fTitle, setFTitle] = useState("");
  const [fSeverity, setFSeverity] = useState<any>("high");
  const [fDesc, setFDesc] = useState("");
  const [fRec, setFRec] = useState("");

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) return;

    await onAddFinding({
      id: generateId(),
      title: fTitle.trim(),
      severity: fSeverity,
      description: fDesc.trim(),
      recommendation: fRec.trim(),
    });

    setFTitle("");
    setFDesc("");
    setFRec("");
    setShowFindingForm(false);
  };

  const handleExportPdf = async () => {
    const pdfBytes = await generateAuditPdf({
      title: session.title,
      clientName: session.clientName || "Direct / Internal",
      clientCompany: session.clientCompany,
      level: session.level,
      scope: session.scope,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      findings: session.parsedFindings,
      notes: session.notes,
    });
    downloadPdf(pdfBytes, `Security_Audit_${session.title.replace(/\s+/g, "_")}.pdf`);
  };

  const levelObj =
    AUDIT_LEVELS.find((l) => l.value === session.level) || AUDIT_LEVELS[0];

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {session.title}
                </h2>
                <Badge variant="outline" className={`text-xs ${levelObj.badge}`}>
                  {levelObj.label}
                </Badge>
                <Badge variant="secondary" className="text-xs uppercase font-mono">
                  {session.status}
                </Badge>
              </div>

              {session.clientName && (
                <p className="text-xs text-muted-foreground">
                  Client Target: {session.clientName}{" "}
                  {session.clientCompany ? `(${session.clientCompany})` : ""}
                </p>
              )}

              {session.scope && (
                <p className="text-xs font-mono text-muted-foreground">
                  Scope: {session.scope}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs font-semibold shadow-xs"
                onClick={handleExportPdf}
                title="Generate branded PDF audit report"
              >
                <Download className="h-3.5 w-3.5" />
                Generate PDF Report
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDeleteSession}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: OWASP Checklists vs Logged Findings */}
      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="bg-secondary/40 border border-border/50">
          <TabsTrigger value="findings" className="gap-2 text-xs">
            <Bug className="h-3.5 w-3.5 text-rose-400" />
            Vulnerability Findings ({session.parsedFindings.length})
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-2 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
            Audit Scope Checklists
          </TabsTrigger>
        </TabsList>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Documented vulnerabilities & proof of concepts
            </span>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-7 text-xs"
              onClick={() => setShowFindingForm(!showFindingForm)}
            >
              <Plus className="h-3.5 w-3.5" />
              Log Vulnerability
            </Button>
          </div>

          {showFindingForm && (
            <Card className="border-rose-500/40 bg-card">
              <CardContent className="p-4">
                <form onSubmit={handleCreateFinding} className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="font-semibold text-muted-foreground">
                        Finding Title *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Broken Object Level Auth (IDOR) on /api/user/orders"
                        className="h-8 text-xs"
                        value={fTitle}
                        onChange={(e) => setFTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">
                        Severity
                      </label>
                      <select
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                        value={fSeverity}
                        onChange={(e) => setFSeverity(e.target.value)}
                      >
                        {SEVERITIES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">
                      Description & Vulnerability Impact
                    </label>
                    <textarea
                      className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
                      placeholder="Explain how the flaw works, parameter affected, steps to reproduce..."
                      value={fDesc}
                      onChange={(e) => setFDesc(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">
                      Remediation & Fix Recommendations
                    </label>
                    <textarea
                      className="w-full min-h-[50px] rounded-md border border-input bg-background p-2 text-xs shadow-sm"
                      placeholder="Code changes, header configuration, access control policy..."
                      value={fRec}
                      onChange={(e) => setFRec(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFindingForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Record Finding
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Findings List */}
          <div className="space-y-2.5">
            {session.parsedFindings.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center text-muted-foreground">
                <Bug className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No vulnerabilities logged in this session yet.</p>
              </div>
            ) : (
              session.parsedFindings.map((f, i) => {
                const sevObj =
                  SEVERITIES.find((s) => s.value === f.severity) || SEVERITIES[0];

                return (
                  <Card key={f.id} className="border-border/60">
                    <CardContent className="p-3.5 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sevObj.color}`}
                          >
                            {sevObj.label}
                          </span>
                          <span className="font-bold text-foreground">
                            {i + 1}. {f.title}
                          </span>
                        </div>
                      </div>

                      {f.description && (
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {f.description}
                        </p>
                      )}

                      {f.recommendation && (
                        <div className="pt-2 border-t border-border/40">
                          <span className="font-semibold text-emerald-400 block mb-0.5">
                            Recommended Fix:
                          </span>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {f.recommendation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4 pt-2">
          {Object.entries(session.parsedChecklist).map(([lvlKey, items]) => {
            const levelLabel =
              AUDIT_LEVELS.find((l) => l.value === lvlKey)?.label || lvlKey;

            const total = items.length;
            const completed = items.filter((i) => i.done).length;

            return (
              <Card key={lvlKey} className="border-border/60">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
                      {levelLabel} Checklist
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {completed} / {total} tests verified
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0 space-y-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      onClick={() => onToggleChecklist(lvlKey, it.id)}
                      className={`flex items-start gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                        it.done
                          ? "line-through text-muted-foreground/60 bg-secondary/20"
                          : "hover:bg-secondary/40 text-foreground"
                      }`}
                    >
                      {it.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-[10px] text-muted-foreground mr-1">
                          [{it.category}]
                        </span>
                        <span>{it.item}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
