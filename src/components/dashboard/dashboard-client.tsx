"use client";

import { format, isSameDay, parseISO, subDays } from "date-fns";
import { Activity, CalendarClock, CheckCircle2, Clock3, Flame, ListChecks } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/hooks/use-activity";
import { useTasks } from "@/hooks/use-tasks";
import { calculateStats, formatDate, isOverdue } from "@/lib/utils";

const chartColors = ["#14b8a6", "#f4c95d", "#0ea5e9", "#f43f5e", "#8b5cf6", "#64748b"];

function activityLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function DashboardClient() {
  const { tasks, isLoading, error } = useTasks({ includeArchived: false });
  const activity = useActivity(8);
  const stats = calculateStats(tasks);

  const weekly = Array.from({ length: 7 })
    .map((_, index) => {
      const day = subDays(new Date(), 6 - index);
      return {
        day: format(day, "EEE"),
        completed: tasks.filter((task) => task.completed_at && isSameDay(parseISO(task.completed_at), day)).length,
        created: tasks.filter((task) => isSameDay(parseISO(task.created_at), day)).length,
      };
    });

  const completionData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending + stats.inProgress + stats.overdue },
  ];

  const categoryData = Array.from(
    tasks.reduce((map, task) => {
      const key = task.category?.name ?? "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).map(([name, value]) => ({ name, value }));

  const upcoming = tasks
    .filter((task) => task.due_date && !task.completed && task.status !== "completed")
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
    .slice(0, 6);

  if (error) {
    return (
      <section className="surface rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">Dashboard could not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Today at a glance</h1>
          <p className="mt-2 text-sm text-muted-foreground">A real-time read on workload, deadlines, and momentum.</p>
        </div>
        <Badge className="w-fit">
          <Flame className="size-3.5" aria-hidden="true" />
          {stats.productivity}% productive
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: stats.total, icon: ListChecks },
            { label: "Completed", value: stats.completed, icon: CheckCircle2 },
            { label: "Pending", value: stats.pending, icon: Clock3 },
            { label: "In progress", value: stats.inProgress, icon: Activity },
            { label: "Overdue", value: stats.overdue, icon: CalendarClock },
          ].map((item) => (
            <Card key={item.label} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <item.icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly productivity</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Legend />
                  <Bar dataKey="created" name="Created" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
                  <Bar dataKey="completed" name="Completed" radius={[8, 8, 0, 0]} fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completed vs pending</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={completionData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={4}>
                      {completionData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData.length ? categoryData : [{ name: "No tasks", value: 1 }]} dataKey="value" nameKey="name" outerRadius={88}>
                      {(categoryData.length ? categoryData : [{ name: "No tasks", value: 1 }]).map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6">
          <PomodoroTimer />
          <Card>
            <CardHeader>
              <CardTitle>Upcoming deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcoming.length ? (
                  upcoming.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">{task.title}</p>
                        {isOverdue(task) ? <Badge variant="danger">Overdue</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.due_date)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deadlines are waiting.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.length ? (
                  activity.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl bg-muted p-3">
                      <span className="mt-1 size-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{activityLabel(item.action)}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(item.timestamp), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Activity will appear as tasks change.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
