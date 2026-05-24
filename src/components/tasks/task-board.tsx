"use client";

import { useEffect, useMemo, useState } from "react";
import { isSameDay, isThisWeek, parseISO } from "date-fns";
import { ListTodo, Plus } from "lucide-react";

import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useTasks } from "@/hooks/use-tasks";
import { isOverdue, matchesCreatedFilter } from "@/lib/utils";
import { useTaskViewStore } from "@/store/use-task-view-store";
import type { TaskStatus, TaskWithDetails } from "@/types/database";
import type { TaskFormValues } from "@/types/task";

const statusGroups: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

function taskMatchesDueFilter(task: TaskWithDetails, due: ReturnType<typeof useTaskViewStore.getState>["filters"]["due"]) {
  if (due === "all") return true;
  if (due === "none") return !task.due_date;
  if (due === "overdue") return isOverdue(task);
  if (!task.due_date) return false;

  const date = parseISO(task.due_date);
  if (due === "today") return isSameDay(date, new Date());
  if (due === "week") return isThisWeek(date);
  return true;
}

export function TaskBoard({
  mode = "all",
  title = "My Tasks",
  description = "Plan, prioritize, and finish the work that matters.",
}: {
  mode?: "all" | "completed";
  title?: string;
  description?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const { filters, setFilter } = useTaskViewStore();
  const { categories } = useCategories();
  const {
    tasks,
    isLoading,
    isMutating,
    error,
    hasMore,
    loadMore,
    createTask,
    updateTask,
    removeTask,
    duplicateTask,
    toggleComplete,
    archive,
  } = useTasks({ includeArchived: true });

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (["pending", "in_progress", "completed", "archived"].includes(status ?? "")) {
      setFilter("status", status as TaskStatus);
    }
  }, [setFilter]);

  const filteredTasks = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return tasks.filter((task) => {
      if (mode === "completed" && !(task.completed || task.status === "completed")) return false;
      if (mode === "all" && filters.status !== "archived" && task.status === "archived") return false;
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.categoryId !== "all" && task.category_id !== filters.categoryId) return false;
      if (!taskMatchesDueFilter(task, filters.due)) return false;
      if (!matchesCreatedFilter(task.created_at, filters.created)) return false;

      if (filters.tag && !task.tags.some((tag) => tag.name.includes(filters.tag.toLowerCase()))) {
        return false;
      }

      if (!query) return true;

      const searchable = [
        task.title,
        task.description ?? "",
        task.notes ?? "",
        task.category?.name ?? "",
        ...task.tags.map((tag) => tag.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [filters, mode, tasks]);

  const groups = statusGroups
    .map((group) => ({
      ...group,
      tasks: filteredTasks.filter((task) => task.status === group.value),
    }))
    .filter((group) => group.tasks.length || filters.status === "all");

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const submitTask = async (values: TaskFormValues) => {
    if (editingTask) {
      await updateTask(editingTask.id, values);
    } else {
      await createTask(values);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{mode === "completed" ? "Archive of wins" : "Personal command center"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New task
        </Button>
      </div>

      <TaskFilters categories={categories} resultCount={filteredTasks.length} onCreate={openCreate} />

      {error ? (
        <EmptyState icon={ListTodo} title="Tasks could not load" description={error} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : filteredTasks.length ? (
        <div className="grid gap-5 xl:grid-cols-4">
          {groups.map((group) => (
            <section key={group.value} className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">{group.label}</h2>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{group.tasks.length}</span>
              </div>
              <div className="space-y-4">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setDialogOpen(true);
                    }}
                    onDelete={() => {
                      if (window.confirm("Delete this task?")) void removeTask(task.id);
                    }}
                    onDuplicate={() => void duplicateTask(task)}
                    onToggle={() => void toggleComplete(task)}
                    onArchive={() => void archive(task.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListTodo}
          title="No tasks match this view"
          description="Create a task or clear a few filters to get your workspace moving."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              New task
            </Button>
          }
        />
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => void loadMore()}>
            Load more
          </Button>
        </div>
      ) : null}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        task={editingTask}
        onSubmit={submitTask}
        isLoading={isMutating}
      />
    </section>
  );
}
