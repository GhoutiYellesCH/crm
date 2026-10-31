import React, { useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Linkedin,
  ShieldAlert,
  Cpu,
  TrendingUp,
  Sparkles,
  Send,
  UserCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LEAD_STAGES } from "@/services/lead/leadService";
import { formatDate } from "@/lib/utils";
import {
  EmailActionMenu,
  PhoneActionMenu,
  SocialLinksRow,
} from "@/components/common/ContactActionMenu";
import type { LeadWithDetails } from "@/services/lead/leadService";

interface LeadDetailPaneProps {
  lead: LeadWithDetails;
  onEnrich: () => Promise<void>;
  onConvert: () => Promise<void>;
  onLogOutreach: (type: "email" | "call" | "meeting" | "note", subject: string, content: string) => Promise<void>;
  onChangeStage: (stage: string) => Promise<void>;
  onDelete: () => void;
}

export function LeadDetailPane({
  lead,
  onEnrich,
  onConvert,
  onLogOutreach,
  onChangeStage,
  onDelete,
}: LeadDetailPaneProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Outreach quick composer
  const [outreachType, setOutreachType] = useState<"email" | "call" | "note">("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Auto-generate cold pitch template based on lead data
  const handleGenerateTemplate = (serviceType: "security" | "ai" | "web") => {
    const contact = lead.decisionMaker || "Founder / Team";
    const company = lead.companyName;

    if (serviceType === "security") {
      setSubject(`Security observation regarding ${company}'s web surface`);
      setMessage(
        `Hi ${contact},\n\nI noticed ${company}'s web infrastructure while analyzing tech stacks in your space. We identified a few key exposure gaps around security headers and potential authentication attack surfaces.\n\nWe provide complete 3-level Security Audits (Black Box external penetration testing, User-level IDOR/auth testing, and Admin-level server hardening).\n\nWould you be open to a 10-minute brief debrief this week?\n\nBest regards,\nNetwork & Security Engineer`
      );
    } else if (serviceType === "ai") {
      setSubject(`Automating client operations & AI integration for ${company}`);
      setMessage(
        `Hi ${contact},\n\nHope all is well. I've been following ${company} and wanted to reach out regarding automating repetitive backend workflows using custom AI integrations.\n\nWe help businesses reduce support and operational friction by integrating clean, self-hosted or API-driven AI assistants.\n\nAre you available for a quick exploratory call?\n\nBest regards,`
      );
    } else {
      setSubject(`Modernizing & hardening ${company}'s application stack`);
      setMessage(
        `Hi ${contact},\n\nI was reviewing ${company}'s website and noticed opportunities to dramatically increase performance, load speed, and security architecture.\n\nWe build custom, clean-coded, and hardened web, desktop, and mobile applications with complete backend infrastructure.\n\nLet me know if you would like to review some previous work.\n\nBest regards,`
      );
    }
  };

  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onLogOutreach(outreachType, subject || `Cold ${outreachType}`, message);
      setSubject("");
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleEnrichClick = async () => {
    setIsEnriching(true);
    try {
      await onEnrich();
    } finally {
      setIsEnriching(false);
    }
  };

  const handleConvertClick = async () => {
    setIsConverting(true);
    try {
      await onConvert();
    } finally {
      setIsConverting(false);
    }
  };

  const stageObj = LEAD_STAGES.find((s) => s.value === lead.stage) || LEAD_STAGES[0];

  const currentScore = lead.leadScore ?? 0;

  return (
    <div className="space-y-6">
      {/* Lead Score & Header Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {lead.companyName}
                </h2>
                <Badge variant="outline" className={`text-xs ${stageObj.color}`}>
                  {stageObj.label}
                </Badge>
                {lead.source && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    via {lead.source}
                  </span>
                )}
              </div>

              {/* Website & Social Links */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <SocialLinksRow
                  website={lead.website}
                  linkedin={lead.linkedin}
                />
              </div>

              {/* Decision Makers List & Contacts */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Decision Makers & Key Contacts:
                </span>
                {lead.parsedDecisionMakers && lead.parsedDecisionMakers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.parsedDecisionMakers.map((dm, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-secondary/40 border border-border/50 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <span>👤 {dm.name}</span>
                          {dm.role && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal">
                              {dm.role}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          {dm.email && <EmailActionMenu email={dm.email} variant="pill" />}
                          {dm.phone && <PhoneActionMenu phone={dm.phone} variant="pill" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    {lead.decisionMaker && (
                      <div className="p-1.5 px-2 rounded bg-secondary/40 border border-border/50 text-xs flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">👤 {lead.decisionMaker}</span>
                        {lead.decisionMakerRole && (
                          <span className="text-muted-foreground text-[10px]">({lead.decisionMakerRole})</span>
                        )}
                      </div>
                    )}
                    {lead.email && <EmailActionMenu email={lead.email} variant="pill" />}
                    {lead.phone && <PhoneActionMenu phone={lead.phone} variant="pill" />}
                  </div>
                )}
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Opportunity Score
                </span>
                <span
                  className={`text-2xl font-black ${
                    currentScore >= 70
                      ? "text-emerald-400"
                      : currentScore >= 40
                      ? "text-amber-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {Math.round(currentScore)}/100
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleEnrichClick}
              disabled={isEnriching || !lead.website}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              {isEnriching ? "Enriching via OSINT..." : "Run OSINT Enrichment"}
            </Button>

            {lead.stage !== "converted" ? (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleConvertClick}
                disabled={isConverting}
              >
                <UserCheck className="h-3.5 w-3.5" />
                {isConverting ? "Converting..." : "Convert to Client Account"}
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                ✓ Converted to Active Client
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto"
              onClick={() => {
                if (confirm(`Delete lead "${lead.companyName}"?`)) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Grid: Score Breakdown, Vulnerabilities & Tech */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Breakdown */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Score Breakdown Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {Object.keys(lead.parsedScoreBreakdown).length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-xs">
                Run OSINT enrichment to calculate breakdown signals.
              </p>
            ) : (
              Object.entries(lead.parsedScoreBreakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-bold text-emerald-400">+{v} pts</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Security Gaps */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-rose-400 uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5" />
              Detected Security Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {lead.parsedSecurityIssues.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-xs">
                No security vulnerabilities logged yet.
              </p>
            ) : (
              lead.parsedSecurityIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-secondary/30 border border-border/40 space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground capitalize">
                      {issue.type.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase text-rose-400">
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{issue.detail}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outreach Workbench (Email & Cold Call Script Generator) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Cold Outreach Generator & History
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Quick Pitch:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleGenerateTemplate("security")}
              >
                🛡️ Security Audit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleGenerateTemplate("ai")}
              >
                🤖 AI Automation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleGenerateTemplate("web")}
              >
                💻 Secure App
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSendOutreach} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <select
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm"
                value={outreachType}
                onChange={(e) => setOutreachType(e.target.value as any)}
              >
                <option value="email">Email Outreach</option>
                <option value="call">Phone Call Script</option>
                <option value="note">Internal Qualification Note</option>
              </select>

              <div className="col-span-2">
                <Input
                  placeholder="Subject or call objective..."
                  className="h-8 text-xs"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <textarea
              className="w-full min-h-[90px] rounded-md border border-input bg-background p-2.5 text-xs shadow-sm font-mono leading-relaxed"
              placeholder="Draft your cold email or call notes here (or select a quick pitch above)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-between items-center">
              {lead.email && outreachType === "email" ? (
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(
                    subject
                  )}&body=${encodeURIComponent(message)}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Open in Mail Client ({lead.email})
                </a>
              ) : (
                <div />
              )}

              <Button type="submit" size="sm" disabled={isSending || !message.trim()} className="gap-1.5 h-8 text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                {isSending ? "Logging..." : "Log Outreach Attempt"}
              </Button>
            </div>
          </form>

          {/* Past Outreach History */}
          {lead.outreachHistory && lead.outreachHistory.length > 0 && (
            <div className="pt-3 border-t border-border/40 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Outreach History
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {lead.outreachHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded bg-secondary/30 border border-border/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="font-semibold uppercase text-primary">
                        {h.type}
                      </span>
                      <span>{formatDate(h.date, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    {h.subject && <p className="font-medium text-foreground">{h.subject}</p>}
                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{h.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
