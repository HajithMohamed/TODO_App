import type { SupabaseClient } from "@supabase/supabase-js";

import { categoryColors } from "@/lib/constants";
import { normalizeTag } from "@/lib/utils";
import { logActivity } from "@/services/activity-service";
import type { Category, Database, Subtask, Tag, Task, TaskTag, TaskWithDetails } from "@/types/database";
import type { TaskFormValues } from "@/types/task";

type Client = SupabaseClient<Database>;

function mapTaskPayload(userId: string, values: TaskFormValues) {
  const completed = values.status === "completed";

  return {
    user_id: userId,
    title: values.title.trim(),
    description: values.description?.trim() || null,
    priority: values.priority,
    status: values.status,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    due_date: values.due_date || null,
    category_id: values.category_id || null,
    notes: values.notes?.trim() || null,
  };
}

function mapTaskUpdatePayload(values: TaskFormValues) {
  const completed = values.status === "completed";

  return {
    title: values.title.trim(),
    description: values.description?.trim() || null,
    priority: values.priority,
    status: values.status,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    due_date: values.due_date || null,
    category_id: values.category_id || null,
    notes: values.notes?.trim() || null,
  };
}

function mergeTaskDetails(
  tasks: Task[],
  categories: Category[],
  subtasks: Subtask[],
  tags: Tag[],
  taskTags: TaskTag[],
): TaskWithDetails[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const subtasksByTask = new Map<string, Subtask[]>();
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));
  const taskTagsByTask = new Map<string, TaskTag[]>();

  subtasks.forEach((subtask) => {
    const items = subtasksByTask.get(subtask.task_id) ?? [];
    items.push(subtask);
    subtasksByTask.set(subtask.task_id, items);
  });

  taskTags.forEach((taskTag) => {
    const items = taskTagsByTask.get(taskTag.task_id) ?? [];
    items.push(taskTag);
    taskTagsByTask.set(taskTag.task_id, items);
  });

  return tasks.map((task) => ({
    ...task,
    category: task.category_id ? categoryById.get(task.category_id) ?? null : null,
    subtasks: (subtasksByTask.get(task.id) ?? []).sort((a, b) => a.position - b.position),
    tags: (taskTagsByTask.get(task.id) ?? []).map((item) => tagById.get(item.tag_id)).filter(Boolean) as Tag[],
  }));
}

async function syncSubtasks(supabase: Client, userId: string, taskId: string, subtasks: TaskFormValues["subtasks"]) {
  await supabase.from("subtasks").delete().eq("task_id", taskId);

  const rows = subtasks
    .filter((subtask) => subtask.title.trim().length > 0)
    .map((subtask, index) => ({
      user_id: userId,
      task_id: taskId,
      title: subtask.title.trim(),
      completed: Boolean(subtask.completed),
      position: index,
    }));

  if (rows.length) {
    const { error } = await supabase.from("subtasks").insert(rows);
    if (error) throw error;
  }
}

async function syncTags(supabase: Client, userId: string, taskId: string, tagInput: string) {
  await supabase.from("task_tags").delete().eq("task_id", taskId);

  const names = Array.from(new Set(tagInput.split(",").map(normalizeTag).filter(Boolean)));
  if (!names.length) return;

  const tagRows = names.map((name, index) => ({
    user_id: userId,
    name,
    color: categoryColors[index % categoryColors.length],
  }));

  const { data: tags, error: upsertError } = await supabase
    .from("tags")
    .upsert(tagRows, { onConflict: "user_id,name" })
    .select("*");

  if (upsertError) throw upsertError;

  const linkRows = (tags ?? []).map((tag) => ({
    task_id: taskId,
    tag_id: tag.id,
    user_id: userId,
  }));

  if (linkRows.length) {
    const { error } = await supabase.from("task_tags").insert(linkRows);
    if (error) throw error;
  }
}

export async function fetchTasks(
  supabase: Client,
  userId: string,
  options: { page?: number; pageSize?: number; includeArchived?: boolean } = {},
) {
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 60;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (!options.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data: tasks, error } = await query;
  if (error) throw error;

  const taskList = tasks ?? [];
  const taskIds = taskList.map((task) => task.id);

  const [categoriesResult, subtasksResult, tagsResult, taskTagsResult] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", userId),
    taskIds.length
      ? supabase.from("subtasks").select("*").in("task_id", taskIds).order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase.from("tags").select("*").eq("user_id", userId),
    taskIds.length ? supabase.from("task_tags").select("*").in("task_id", taskIds) : Promise.resolve({ data: [], error: null }),
  ]);

  const firstError = categoriesResult.error || subtasksResult.error || tagsResult.error || taskTagsResult.error;
  if (firstError) throw firstError;

  return mergeTaskDetails(
    taskList,
    categoriesResult.data ?? [],
    subtasksResult.data ?? [],
    tagsResult.data ?? [],
    taskTagsResult.data ?? [],
  );
}

export async function createTask(supabase: Client, userId: string, values: TaskFormValues) {
  const { data: task, error } = await supabase
    .from("tasks")
    .insert(mapTaskPayload(userId, values))
    .select("*")
    .single();

  if (error) throw error;

  await syncSubtasks(supabase, userId, task.id, values.subtasks);
  await syncTags(supabase, userId, task.id, values.tags);
  await logActivity(supabase, { userId, taskId: task.id, action: "created_task", metadata: { title: task.title } });

  return task;
}

export async function updateTask(supabase: Client, userId: string, taskId: string, values: TaskFormValues) {
  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      ...mapTaskUpdatePayload(values),
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;

  await syncSubtasks(supabase, userId, task.id, values.subtasks);
  await syncTags(supabase, userId, task.id, values.tags);
  await logActivity(supabase, { userId, taskId: task.id, action: "updated_task", metadata: { title: task.title } });

  return task;
}

export async function deleteTask(supabase: Client, userId: string, taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
  await logActivity(supabase, { userId, taskId: null, action: "deleted_task", metadata: { taskId } });
}

export async function duplicateTask(supabase: Client, userId: string, task: TaskWithDetails) {
  const created = await createTask(supabase, userId, {
    title: `${task.title} copy`,
    description: task.description ?? "",
    priority: task.priority,
    status: "pending",
    due_date: task.due_date ?? "",
    category_id: task.category_id ?? "",
    tags: task.tags.map((tag) => tag.name).join(", "),
    notes: task.notes ?? "",
    subtasks: task.subtasks.map((subtask) => ({ title: subtask.title, completed: false })),
  });

  await logActivity(supabase, { userId, taskId: created.id, action: "duplicated_task", metadata: { sourceTask: task.id } });
  return created;
}

export async function toggleTaskCompleted(supabase: Client, userId: string, task: TaskWithDetails) {
  const nextCompleted = !task.completed;
  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed: nextCompleted,
      status: nextCompleted ? "completed" : "pending",
      completed_at: nextCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id)
    .select("*")
    .single();

  if (error) throw error;

  await logActivity(supabase, {
    userId,
    taskId: task.id,
    action: nextCompleted ? "completed_task" : "restored_task",
    metadata: { title: task.title },
  });

  return data;
}

export async function archiveTask(supabase: Client, userId: string, taskId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;
  await logActivity(supabase, { userId, taskId, action: "archived_task", metadata: {} });
  return data;
}
