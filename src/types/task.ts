import type { Category, TaskPriority, TaskStatus } from "@/types/database";

export type TaskFilterState = {
  query: string;
  priority: TaskPriority | "all";
  status: TaskStatus | "all";
  categoryId: string | "all";
  tag: string;
  due: "all" | "today" | "week" | "overdue" | "none";
  created: "all" | "today" | "week" | "month";
};

export type TaskFormValues = {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  category_id?: string;
  tags: string;
  notes?: string;
  subtasks: { title: string; completed?: boolean }[];
};

export type CategoryFormValues = Pick<Category, "name" | "color">;
