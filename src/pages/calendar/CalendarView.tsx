import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Building2,
  Target,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CalendarCheck,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCalendarStore } from "@/store/useCalendarStore";
import { useClientStore } from "@/store/useClientStore";
import { useTaskProjectStore } from "@/store/useTaskProjectStore";
import { useLeadStore } from "@/store/useLeadStore";
import { EventForm } from "./EventForm";
import { EVENT_TYPES } from "@/services/calendarService";
import { formatDate } from "@/lib/utils";

export default function CalendarView() {
  const { t } = useTranslation();
  const {
    events,
    selectedDate,
    selectedTypeFilter,
    loadEvents,
    saveEventData,
    removeEvent,
    setSelectedDate,
    setSelectedTypeFilter,
  } = useCalendarStore();

  const { clients, loadClients } = useClientStore();
  const { tasks, loadData: loadTasks } = useTaskProjectStore();
  const { leads, loadLeads } = useLeadStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  useEffect(() => {
    loadEvents();
    loadClients();
    loadTasks();
    loadLeads();
  }, [loadEvents, loadClients, loadTasks, loadLeads]);

  // Current view month & year calculations
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedTypeFilter !== "all" && e.type !== selectedTypeFilter) return false;
    return true;
  });

  // Selected date events
  const selectedDateEvents = filteredEvents.filter((e) => {
    const d = new Date(e.startAt * 1000);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            {t("calendar.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Workflow schedule, client meetings, project milestones, and desktop reminders.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 shadow-sm"
          onClick={() => {
            setEditingEvent(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("calendar.new")}
        </Button>
      </div>

      {/* Main Grid: Calendar Month Grid + Day Agenda Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar View */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-4">
              {/* Month Navigation & Type Filter */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    {monthNames[viewMonth]} {viewYear}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={prevMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={nextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <select
                    className="h-7 rounded-md border border-input bg-background px-2 text-[11px] shadow-sm"
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  >
                    <option value="all">All Event Types</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-muted-foreground uppercase tracking-wider py-1 border-b border-border/40">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Month Calendar Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty spacer cells before month start */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 rounded-md bg-secondary/10 opacity-30" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDate = new Date(viewYear, viewMonth, dayNum);
                  const isSelected =
                    selectedDate.getDate() === dayNum &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getFullYear() === viewYear;

                  const isToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === viewMonth &&
                    new Date().getFullYear() === viewYear;

                  // Find events on this day
                  const dayEvents = filteredEvents.filter((e) => {
                    const d = new Date(e.startAt * 1000);
                    return (
                      d.getDate() === dayNum &&
                      d.getMonth() === viewMonth &&
                      d.getFullYear() === viewYear
                    );
                  });

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dayDate)}
                      className={`h-20 p-1.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : isToday
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border/40 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            isToday ? "text-emerald-400 font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] px-1 rounded-full bg-secondary text-secondary-foreground font-mono">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event dots/previews */}
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const typeObj =
                            EVENT_TYPES.find((t) => t.value === ev.type) || EVENT_TYPES[0];
                          return (
                            <div
                              key={ev.id}
                              className={`text-[9px] truncate px-1 py-0.2 rounded border ${typeObj.color}`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] text-muted-foreground pl-0.5">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Selected Day Agenda & Upcoming */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedDateEvents.length} scheduled event(s)
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    setEditingEvent(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>

              {/* Agenda List */}
              <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No events scheduled for this day.</p>
                  </div>
                ) : (
                  selectedDateEvents.map((ev) => {
                    const typeObj =
                      EVENT_TYPES.find((t) => t.value === ev.type) || EVENT_TYPES[0];
                    const startTime = new Date(ev.startAt * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    );

                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-1.5 text-xs hover:border-border transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className={`text-[9px] ${typeObj.color}`}>
                            {typeObj.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => removeEvent(ev.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="font-semibold text-foreground leading-snug">
                          {ev.title}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{startTime}</span>
                        </div>

                        {(ev.clientName || ev.leadName) && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                            {ev.clientName ? (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-2.5 w-2.5" />
                                {ev.clientName}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Target className="h-2.5 w-2.5" />
                                {ev.leadName}
                              </span>
                            )}
                          </div>
                        )}

                        {ev.description && (
                          <p className="text-[10px] text-muted-foreground italic whitespace-pre-wrap">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        tasks={tasks}
        leads={leads}
        initialData={editingEvent}
        defaultDate={selectedDate}
        onSave={async (data) => {
          await saveEventData(data);
        }}
      />
    </div>
  );
}
