import { type ClassValue, clsx } from "clsx";
import { format, isBefore, isSameDay, isThisMonth, isThisWeek, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import type { DashboardStats, TaskPriority, TaskStatus, TaskWithDetails } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return format(parseISO(value), "MMM d, yyyy");
}

export function isOverdue(task: Pick<TaskWithDetails, "due_date" | "completed" | "status">) {
  if (!task.due_date || task.completed || task.status === "completed" || task.status === "archived") {
    return false;
  }

  return isBefore(parseISO(task.due_date), new Date()) && !isSameDay(parseISO(task.due_date), new Date());
}

export function calculateStats(tasks: TaskWithDetails[]): DashboardStats {
  const activeTasks = tasks.filter((task) => task.status !== "archived");
  const completed = activeTasks.filter((task) => task.completed || task.status === "completed").length;
  const pending = activeTasks.filter((task) => task.status === "pending").length;
  const inProgress = activeTasks.filter((task) => task.status === "in_progress").length;
  const overdue = activeTasks.filter(isOverdue).length;
  const productivity = activeTasks.length ? Math.round((completed / activeTasks.length) * 100) : 0;

  return {
    total: activeTasks.length,
    completed,
    pending,
    inProgress,
    overdue,
    archived: tasks.length - activeTasks.length,
    productivity,
  };
}

export function matchesCreatedFilter(createdAt: string, filter: "all" | "today" | "week" | "month") {
  const created = parseISO(createdAt);

  if (filter === "today") return isSameDay(created, new Date());
  if (filter === "week") return isThisWeek(created);
  if (filter === "month") return isThisMonth(created);
  return true;
}

export function priorityLabel(priority: TaskPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function statusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    archived: "Archived",
  };

  return labels[status];
}

export function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "User";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 32);
}
