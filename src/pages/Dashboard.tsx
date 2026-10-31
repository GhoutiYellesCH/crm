import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Users,
  CheckSquare,
  FolderKanban,
  DollarSign,
  Target,
  Shield,
  TrendingUp,
  Clock,
  Repeat,
  Coins,
  ArrowRight,
  Sparkles,
  Calculator,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClientStore } from "@/store/useClientStore";
import { useTaskProjectStore } from "@/store/useTaskProjectStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useLeadStore } from "@/store/useLeadStore";
import { useAuditStore } from "@/store/useAuditStore";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { convertCurrency, formatMoney } from "@/lib/currencies";
import { CurrencyCalculatorModal } from "@/components/finance/CurrencyCalculatorModal";
import { fetchAllActivities, computeHeatmapAndStreaks } from "@/services/activityService";

export default function Dashboard() {
  const { t } = useTranslation();
  const { mainCurrency } = useUIStore();
  const { clients, loadClients } = useClientStore();
  const { tasks, projects, loadData: loadTaskData } = useTaskProjectStore();
  const { invoices, recurring, loadData: loadFinanceData } = useFinanceStore();
  const { leads, loadLeads } = useLeadStore();
  const { sessions: audits, loadSessions: loadAuditData } = useAuditStore();

  const [calcOpen, setCalcOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    loadClients();
    loadTaskData();
    loadFinanceData();
    loadLeads();
    loadAuditData();
    fetchAllActivities()
      .then((acts) => {
        const { streakStats } = computeHeatmapAndStreaks(acts, 30);
        setStreakDays(streakStats.currentStreak);
      })
      .catch(() => {});
  }, [loadClients, loadTaskData, loadFinanceData, loadLeads, loadAuditData]);

  // Aggregate stats
  const activeClients = clients.filter((c) => c.status === "active").length;
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const totalCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => {
      const invCurr = i.currency || "EUR";
      const { result } = convertCurrency(i.total, invCurr, mainCurrency, "black_market");
      return sum + result;
    }, 0);

  const mrrTotal = recurring
    .filter((r) => r.status === "active")
    .reduce((sum, r) => {
      const recCurr = r.currency || "EUR";
      const { result } = convertCurrency(r.amount, recCurr, mainCurrency, "black_market");
      return sum + result;
    }, 0);

  const qualifiedLeads = leads.filter(
    (l) => l.stage === "qualified" || l.stage === "shortlisted"
  ).length;

  const inProgressAudits = audits.filter(
    (a) => a.status === "in_progress"
  ).length;

  const STAT_CARDS = [
    {
      title: "Active Clients",
      value: String(activeClients || clients.length),
      sub: `${clients.length} total in pipeline`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      to: "/clients",
    },
    {
      title: "Open Tasks",
      value: String(openTasks),
      sub: `${tasks.filter((t) => t.status === "done").length} completed`,
      icon: CheckSquare,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      to: "/tasks",
    },
    {
      title: "Active Projects",
      value: String(activeProjects || projects.length),
      sub: `${projects.length} service deliveries`,
      icon: FolderKanban,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      to: "/projects",
    },
    {
      title: "Monthly Retainers (MRR)",
      value: formatMoney(mrrTotal, mainCurrency),
      sub: `${recurring.length} active recurring (${mainCurrency})`,
      icon: Repeat,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      to: "/finance",
    },
    {
      title: "Leads In Funnel",
      value: String(leads.length),
      sub: `${qualifiedLeads} qualified / shortlisted`,
      icon: Target,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      to: "/leads",
    },
    {
      title: "Active Security Audits",
      value: String(inProgressAudits || audits.length),
      sub: `${audits.reduce((acc, a) => acc + a.parsedFindings.length, 0)} findings logged`,
      icon: Shield,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      to: "/audit",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {t("nav.dashboard")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time overview of your freelance & agency operating system.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/activity">
            <Badge
              variant="outline"
              className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30 gap-1.5 cursor-pointer hover:bg-orange-500/20 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
              {streakDays} Day Streak 🔥
            </Badge>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalcOpen(true)}
            className="h-7 text-xs gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Calculator className="h-3.5 w-3.5" />
            {mainCurrency} Calculator
          </Button>

          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            🟢 Local-first Engine
          </Badge>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STAT_CARDS.map((stat) => (
          <Link key={stat.title} to={stat.to}>
            <Card className="border-border/60 hover:border-border transition-all hover:bg-card/80 cursor-pointer h-full">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activity Feeds: Recent Tasks & High Value Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next Urgent Tasks */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <CheckSquare className="h-4 w-4 text-primary" />
              Priority Action Items
            </CardTitle>
            <Link to="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Board <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.filter((t) => t.status !== "done").length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                All tasks completed! Great work.
              </p>
            ) : (
              tasks
                .filter((t) => t.status !== "done")
                .slice(0, 5)
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {task.projectName && <span>Proj: {task.projectName}</span>}
                        {task.assigneeName && <span>• Assigned: {task.assigneeName}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] capitalize shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Highest Score Leads */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Target className="h-4 w-4 text-orange-400" />
              Highest Scoring Leads in Funnel
            </CardTitle>
            <Link to="/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Funnel <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {leads.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No leads found. Run the OSINT scanner to discover target clients.
              </p>
            ) : (
              leads
                .slice()
                .sort((a, b) => (b.leadScore ?? 0) - (a.leadScore ?? 0))
                .slice(0, 5)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="p-2.5 rounded-lg border border-border/40 bg-card/40 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {lead.companyName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.website || "No domain specified"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {lead.stage}
                      </Badge>
                      <span className="font-black text-xs text-emerald-400">
                        {Math.round(lead.leadScore ?? 0)} pts
                      </span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <CurrencyCalculatorModal open={calcOpen} onOpenChange={setCalcOpen} />
    </div>
  );
}
