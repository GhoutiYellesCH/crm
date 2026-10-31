import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  Activity,
  Layers,
  Filter,
  Sparkles,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchAllActivities,
  computeHeatmapAndStreaks,
  type ActivityItem,
  type DayActivity,
  type StreakStats,
} from "@/services/activityService";
import { formatDate } from "@/lib/utils";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ActivityHeatmap() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllActivities();
      setActivities(data);
    } catch (e) {
      console.error("Failed to load activities:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities if user selected a specific filter
  const filteredActivities = activities.filter((act) => {
    if (filterType === "all") return true;
    if (filterType === "tasks") return act.entityType === "task";
    if (filterType === "task_completed")
      return act.entityType === "task" && act.action === "completed";
    if (filterType === "projects") return act.entityType === "project";
    if (filterType === "leads") return act.entityType === "lead";
    if (filterType === "invoices") return act.entityType === "invoice";
    return true;
  });

  const { weeks, daysMap, streakStats } = computeHeatmapAndStreaks(
    filteredActivities,
    365
  );

  // Helper for green square color classes matching user's uploaded image
  const getLevelClasses = (level: number, count: number) => {
    if (count === 0) {
      return "bg-secondary/40 border-border/40 hover:border-primary/50";
    }
    switch (level) {
      case 1:
        return "bg-emerald-950/80 border-emerald-800/50 hover:border-emerald-500";
      case 2:
        return "bg-emerald-700 border-emerald-600 hover:border-emerald-400";
      case 3:
        return "bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.35)] hover:scale-110";
      case 4:
      default:
        return "bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.6)] hover:scale-125";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            Software Activity & Productivity Heatmap
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            GitHub-style contribution grid of task completions, projects, outreach, and daily productivity streaks.
          </p>
        </div>

        {/* Live Streak Pill */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500/15 to-amber-500/15 border-orange-500/40 text-orange-400 font-bold gap-1.5"
          >
            <Flame className="h-4 w-4 fill-orange-400 text-orange-400 animate-pulse" />
            {streakStats.currentStreak} Day Streak 🔥
          </Badge>
        </div>
      </div>

      {/* Streak KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-gradient-to-br from-orange-500/10 via-card to-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Current Streak</span>
              <div className="p-1 rounded-md bg-orange-500/15 text-orange-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-orange-400 tracking-tight">
              {streakStats.currentStreak} {streakStats.currentStreak === 1 ? "Day" : "Days"}
            </p>
            <p className="text-[10px] text-muted-foreground">Consecutive days active</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-amber-500/10 via-card to-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Longest Streak</span>
              <div className="p-1 rounded-md bg-amber-500/15 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400 tracking-tight">
              {streakStats.longestStreak} {streakStats.longestStreak === 1 ? "Day" : "Days"}
            </p>
            <p className="text-[10px] text-muted-foreground">All-time record streak</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-card to-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Active Days</span>
              <div className="p-1 rounded-md bg-emerald-500/15 text-emerald-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              {streakStats.totalActiveDays} Days
            </p>
            <p className="text-[10px] text-muted-foreground">Out of last 365 days</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Total Actions</span>
              <div className="p-1 rounded-md bg-primary/15 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-foreground tracking-tight">
              {streakStats.totalActivities}
            </p>
            <p className="text-[10px] text-muted-foreground">Tasks, projects & deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Range */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {[
            { id: "all", label: "All Activity" },
            { id: "task_completed", label: "✓ Completed Tasks" },
            { id: "tasks", label: "All Tasks" },
            { id: "projects", label: "Projects" },
            { id: "leads", label: "Leads & Outreach" },
            { id: "invoices", label: "Invoices" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={filterType === f.id ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilterType(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <span className="text-[11px] text-muted-foreground font-mono">
          Last 365 Days
        </span>
      </div>

      {/* Heatmap Card (Inspired by GitHub contribution graph & user screenshot) */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Activity Matrix
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-secondary/40 border border-border/50 block" />
                <span className="h-3 w-3 rounded-sm bg-emerald-950/80 border border-emerald-800/50 block" />
                <span className="h-3 w-3 rounded-sm bg-emerald-700 border border-emerald-600 block" />
                <span className="h-3 w-3 rounded-sm bg-emerald-500 border border-emerald-400 block" />
                <span className="h-3 w-3 rounded-sm bg-emerald-400 border border-emerald-300 block shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[760px] select-none py-2">
            {/* Heatmap Grid */}
            <div className="flex gap-1.5">
              {/* Day Labels on left */}
              <div className="flex flex-col justify-between text-[9px] text-muted-foreground pr-2 font-mono h-[106px] shrink-0">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              {/* Columns of weeks */}
              <div className="flex gap-1 flex-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day, dIdx) => {
                      if (!day.dateString) {
                        return (
                          <div
                            key={`empty-${wIdx}-${dIdx}`}
                            className="h-3.5 w-3.5 rounded-sm opacity-0"
                          />
                        );
                      }

                      const isSelected = selectedDay?.dateString === day.dateString;

                      return (
                        <div
                          key={day.dateString}
                          onClick={() => setSelectedDay(day)}
                          title={`${day.dateString}: ${day.count} activity items`}
                          className={`h-3.5 w-3.5 rounded-sm border transition-all cursor-pointer ${getLevelClasses(
                            day.level,
                            day.count
                          )} ${
                            isSelected
                              ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-125 z-10"
                              : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Activity Log or Latest Activity Feed */}
      <Card className="border-border/60">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {selectedDay
                ? `Activity for ${formatDate(selectedDay.dateString, "EEEE, MMMM dd, yyyy")}`
                : "Recent Task & Workflow Activity"}
            </CardTitle>
            {selectedDay && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {selectedDay.count} {selectedDay.count === 1 ? "Action" : "Actions"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {selectedDay && selectedDay.activities.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedDay.activities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500/15 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {item.type} • {item.action}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          ) : selectedDay ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No recorded activity on this day.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredActivities.slice(0, 10).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-primary/10 text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{act.title}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        {act.entityType} • {act.action}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDate(act.createdAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
