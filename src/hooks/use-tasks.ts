"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  archiveTask,
  createTask as createTaskRecord,
  deleteTask,
  duplicateTask as duplicateTaskRecord,
  fetchTasks,
  toggleTaskCompleted,
  updateTask as updateTaskRecord,
} from "@/services/task-service";
import type { TaskWithDetails } from "@/types/database";
import type { TaskFormValues } from "@/types/task";

const pageSize = 60;

export function useTasks(options: { includeArchived?: boolean } = {}) {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (targetPage = 0, mode: "replace" | "append" = "replace") => {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase environment variables are not configured.");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Sign in to load tasks.");
        setIsLoading(false);
        return;
      }

      setUserId(user.id);
      setIsLoading(mode === "replace");

      try {
        const nextTasks = await fetchTasks(supabase, user.id, {
          page: targetPage,
          pageSize,
          includeArchived: options.includeArchived,
        });

        setPage(targetPage);
        setHasMore(nextTasks.length === pageSize);
        setTasks((current) => {
          if (mode === "replace") return nextTasks;
          const byId = new Map(current.map((task) => [task.id, task]));
          nextTasks.forEach((task) => byId.set(task.id, task));
          return Array.from(byId.values());
        });
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load tasks.");
      } finally {
        setIsLoading(false);
      }
    },
    [options.includeArchived],
  );

  const refresh = useCallback(async () => loadPage(0), [loadPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`workspace:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` }, () =>
        void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "subtasks", filter: `user_id=eq.${userId}` }, () =>
        void refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "task_tags", filter: `user_id=eq.${userId}` }, () =>
        void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  const mutate = useCallback(
    async (action: () => Promise<unknown>, success: string) => {
      setIsMutating(true);
      try {
        await action();
        toast.success(success);
        await refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Something went wrong.");
      } finally {
        setIsMutating(false);
      }
    },
    [refresh],
  );

  const createTask = useCallback(
    (values: TaskFormValues) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to create tasks.");
        await createTaskRecord(supabase, userId, values);
      }, "Task created"),
    [mutate, userId],
  );

  const updateTask = useCallback(
    (taskId: string, values: TaskFormValues) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to update tasks.");
        await updateTaskRecord(supabase, userId, taskId, values);
      }, "Task updated"),
    [mutate, userId],
  );

  const removeTask = useCallback(
    (taskId: string) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to delete tasks.");
        await deleteTask(supabase, userId, taskId);
      }, "Task deleted"),
    [mutate, userId],
  );

  const duplicateTask = useCallback(
    (task: TaskWithDetails) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to duplicate tasks.");
        await duplicateTaskRecord(supabase, userId, task);
      }, "Task duplicated"),
    [mutate, userId],
  );

  const toggleComplete = useCallback(
    (task: TaskWithDetails) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to update tasks.");
        await toggleTaskCompleted(supabase, userId, task);
      }, task.completed ? "Task restored" : "Task completed"),
    [mutate, userId],
  );

  const archive = useCallback(
    (taskId: string) =>
      mutate(async () => {
        const supabase = createClient();
        if (!supabase || !userId) throw new Error("Sign in to archive tasks.");
        await archiveTask(supabase, userId, taskId);
      }, "Task archived"),
    [mutate, userId],
  );

  return {
    tasks,
    isLoading,
    isMutating,
    error,
    hasMore,
    refresh,
    loadMore: () => loadPage(page + 1, "append"),
    createTask,
    updateTask,
    removeTask,
    duplicateTask,
    toggleComplete,
    archive,
  };
}
