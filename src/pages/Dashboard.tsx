import { useTranslation } from "react-i18next";
import {
  Users,
  CheckSquare,
  FolderKanban,
  DollarSign,
  Target,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAT_CARDS = [
  {
    title: "Active Clients",
    value: "0",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    change: "+0 this month",
  },
  {
    title: "Open Tasks",
    value: "0",
    icon: CheckSquare,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    change: "0 due today",
  },
  {
    title: "Active Projects",
    value: "0",
    icon: FolderKanban,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    change: "0 due this week",
  },
  {
    title: "Revenue (Month)",
    value: "€0",
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-500/10",
    change: "+0% vs last month",
  },
  {
    title: "Leads in Funnel",
    value: "0",
    icon: Target,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    change: "0 shortlisted",
  },
  {
    title: "Pending Audits",
    value: "0",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10",
    change: "0 in progress",
  },
];

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("nav.dashboard")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">{t("common.noData")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">{t("common.noData")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick status badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          🟢 App running
        </Badge>
        <Badge variant="outline" className="text-xs">
          🗄️ SQLite connected
        </Badge>
        <Badge variant="outline" className="text-xs">
          🌐 i18n active
        </Badge>
        <Badge variant="outline" className="text-xs">
          🎨 Dark mode
        </Badge>
      </div>
    </div>
  );
}
