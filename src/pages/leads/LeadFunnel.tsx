import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Search,
  Sparkles,
  Plus,
  Globe,
  Filter,
  ArrowUpDown,
  Building2,
  ChevronRight,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLeadStore } from "@/store/useLeadStore";
import { LeadDetailPane } from "./LeadDetailPane";
import { LeadForm } from "./LeadForm";
import { LEAD_STAGES } from "@/services/lead/leadService";

export default function LeadFunnel() {
  const { t } = useTranslation();
  const {
    leads,
    selectedLead,
    isLoading,
    isDiscovering,
    selectedStage,
    searchQuery,
    loadLeads,
    selectLead,
    saveLeadData,
    enrichLead,
    convertLead,
    logOutreach,
    changeLeadStage,
    removeLead,
    discoverFromKeyword,
    setSelectedStage,
    setSearchQuery,
  } = useLeadStore();

  const [formOpen, setFormOpen] = useState(false);
  const [discoveryKeyword, setDiscoveryKeyword] = useState("");

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDiscoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryKeyword.trim()) return;
    const count = await discoverFromKeyword(discoveryKeyword.trim());
    alert(`OSINT scan completed. Discovered ${count} new domain target(s).`);
    setDiscoveryKeyword("");
  };

  // Filter leads
  const filtered = leads.filter((lead) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.companyName.toLowerCase().includes(q) ||
      (lead.website && lead.website.toLowerCase().includes(q)) ||
      (lead.industry && lead.industry.toLowerCase().includes(q)) ||
      (lead.city && lead.city.toLowerCase().includes(q));

    const matchesStage = selectedStage === "all" || lead.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            {t("lead.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Discover potential clients via free OSINT (crt.sh/RDAP), score tech vulnerabilities, and run cold outreach.
          </p>
        </div>

        <Button
          onClick={() => setFormOpen(true)}
          size="sm"
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Lead Manually
        </Button>
      </div>

      {/* Discovery Bar (crt.sh / OSINT Free Keyless Search) */}
      <Card className="border-border/60 bg-gradient-to-r from-secondary/30 via-card to-card">
        <CardContent className="p-3.5">
          <form
            onSubmit={handleDiscoverySubmit}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Free OSINT Scanner:</span>
            </div>
            <Input
              placeholder="Search business domain or keyword (e.g. ecommerce.dz, agency, logistics)..."
              className="h-8 text-xs flex-1"
              value={discoveryKeyword}
              onChange={(e) => setDiscoveryKeyword(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isDiscovering || !discoveryKeyword.trim()}
              className="h-8 text-xs gap-1.5 shrink-0"
            >
              <Search className="h-3 w-3" />
              {isDiscovering ? "Scanning Certificates..." : "Discover Domains"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lead Funnel List & Filters */}
        <div className={`${selectedLead ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter leads..."
                className="pl-8 h-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="all">All Stages ({leads.length})</option>
              {LEAD_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Leads Cards */}
          <div className="space-y-2 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-10">
                Loading leads...
              </p>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed rounded-lg p-10 text-center text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No leads in funnel</p>
                <p className="text-xs mt-1 opacity-70">
                  Use the OSINT scanner above or add leads manually to start qualification.
                </p>
              </div>
            ) : (
              filtered.map((lead) => {
                const score = lead.leadScore ?? 0;
                const isSelected = selectedLead?.id === lead.id;
                const stageObj =
                  LEAD_STAGES.find((s) => s.value === lead.stage) || LEAD_STAGES[0];

                return (
                  <Card
                    key={lead.id}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-border hover:bg-card/80"
                    }`}
                    onClick={() => selectLead(lead.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {lead.companyName}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${stageObj.color}`}
                            >
                              {stageObj.label}
                            </Badge>
                          </div>

                          {lead.website && (
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              {lead.website.replace(/^https?:\/\//, "")}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                            {lead.decisionMaker && (
                              <span>Contact: {lead.decisionMaker}</span>
                            )}
                            {lead.parsedSecurityIssues.length > 0 && (
                              <span className="text-rose-400 font-medium">
                                ⚠️ {lead.parsedSecurityIssues.length} gap(s)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Opportunity Score Pill */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className={`px-2 py-0.5 rounded font-black text-xs ${
                              score >= 70
                                ? "bg-emerald-500/15 text-emerald-400"
                                : score >= 40
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {Math.round(score)}
                          </div>
                          <ChevronRight
                            className={`h-3.5 w-3.5 ${
                              isSelected ? "text-primary" : "text-muted-foreground/40"
                            }`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Lead Intelligence Pane */}
        {selectedLead ? (
          <div className="lg:col-span-7">
            <LeadDetailPane
              lead={selectedLead}
              onEnrich={() => enrichLead(selectedLead.id)}
              onConvert={async () => {
                await convertLead(selectedLead.id);
              }}
              onLogOutreach={(type, subject, content) =>
                logOutreach(selectedLead.id, type, subject, content)
              }
              onChangeStage={(stage) => changeLeadStage(selectedLead.id, stage)}
              onDelete={() => removeLead(selectedLead.id)}
            />
          </div>
        ) : (
          filtered.length > 0 && (
            <div className="hidden lg:flex lg:col-span-7 items-center justify-center border border-dashed rounded-lg p-12 text-muted-foreground">
              <div className="text-center space-y-2">
                <FolderOpen className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">Select a lead to inspect intelligence</p>
                <p className="text-xs opacity-70">
                  View vulnerability score breakdown, generate personalized pitches, and convert to active client.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={async (data) => {
          await saveLeadData(data);
        }}
      />
    </div>
  );
}
