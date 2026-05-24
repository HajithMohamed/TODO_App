"use client";

import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priorityOptions, statusOptions } from "@/lib/constants";
import { taskSchema } from "@/lib/validations/task";
import type { Category, TaskWithDetails } from "@/types/database";
import type { TaskFormValues } from "@/types/task";

function valuesFromTask(task?: TaskWithDetails | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "pending",
    due_date: task?.due_date ?? "",
    category_id: task?.category_id ?? "",
    tags: task?.tags.map((tag) => tag.name).join(", ") ?? "",
    notes: task?.notes ?? "",
    subtasks: task?.subtasks.length
      ? task.subtasks.map((subtask) => ({ title: subtask.title, completed: subtask.completed }))
      : [],
  };
}

export function TaskFormDialog({
  open,
  onOpenChange,
  categories,
  task,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  task?: TaskWithDetails | null;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  isLoading?: boolean;
}) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: valuesFromTask(task),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "subtasks" });

  useEffect(() => {
    reset(valuesFromTask(task));
  }, [reset, task, open]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Edit task" : "Create task"}
      description="Capture the work, context, and next step in one place."
    >
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="task-title">
            Title
          </label>
          <Input id="task-title" placeholder="Design task detail view" {...register("title")} />
          {errors.title ? <p className="text-xs text-rose-500">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="task-description">
            Description
          </label>
          <Textarea id="task-description" placeholder="Add useful context..." {...register("description")} />
          {errors.description ? <p className="text-xs text-rose-500">{errors.description.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-priority">
              Priority
            </label>
            <Select id="task-priority" {...register("priority")}>
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-status">
              Status
            </label>
            <Select id="task-status" {...register("status")}>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-due">
              Due date
            </label>
            <Input id="task-due" type="date" {...register("due_date")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-category">
              Category
            </label>
            <Select id="task-category" {...register("category_id")}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-tags">
              Tags
            </label>
            <Input id="task-tags" placeholder="launch, writing, client" {...register("tags")} />
            <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="task-notes">
              Notes
            </label>
            <Textarea id="task-notes" className="min-h-20" placeholder="Private notes..." {...register("notes")} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium">Subtasks</label>
            <Button type="button" size="sm" variant="outline" onClick={() => append({ title: "", completed: false })}>
              <Plus className="size-4" aria-hidden="true" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input aria-label={`Subtask ${index + 1}`} placeholder="Subtask title" {...register(`subtasks.${index}.title`)} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove subtask" onClick={() => remove(index)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
          {errors.subtasks ? <p className="text-xs text-rose-500">Review your subtasks.</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
