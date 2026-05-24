import {
  Archive,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
} from "lucide-react";

import type { TaskPriority, TaskStatus } from "@/types/database";

export const appName = "TaskFlow";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "My Tasks", icon: ListTodo },
  { href: "/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/categories", label: "Categories", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const quickNavItems = [
  { href: "/dashboard", label: "Insights", icon: BarChart3 },
  { href: "/tasks?status=archived", label: "Archive", icon: Archive },
] as const;

export const priorityOptions: { value: TaskPriority; label: string; tone: string }[] = [
  { value: "low", label: "Low", tone: "bg-emerald-500" },
  { value: "medium", label: "Medium", tone: "bg-sky-500" },
  { value: "high", label: "High", tone: "bg-amber-500" },
  { value: "urgent", label: "Urgent", tone: "bg-rose-500" },
];

export const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export const categoryColors = [
  "#14b8a6",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#22c55e",
  "#6366f1",
  "#64748b",
];
