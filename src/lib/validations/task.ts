import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Give this task a clear title.").max(120),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "archived"]),
  due_date: z.string().optional(),
  category_id: z.string().optional(),
  tags: z.string().max(240),
  notes: z.string().max(2000).optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Subtask title is required.").max(140),
        completed: z.boolean().optional(),
      }),
    ),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid color."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  avatar_url: z.string().trim().url("Use a valid image URL.").or(z.literal("")).optional(),
});
