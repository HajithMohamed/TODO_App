"use client";

import { Archive, CalendarClock, Check, Copy, Edit3, RotateCcw, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isOverdue, statusLabel } from "@/lib/utils";
import type { TaskWithDetails } from "@/types/database";

const priorityVariant = {
  low: "success",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onArchive,
}: {
  task: TaskWithDetails;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onArchive: () => void;
}) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
  const overdue = isOverdue(task);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="surface rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
            <Badge>{statusLabel(task.status)}</Badge>
            {overdue ? <Badge variant="danger">Overdue</Badge> : null}
          </div>
          <h3 className="text-base font-semibold leading-6">{task.title}</h3>
          {task.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{task.description}</p> : null}
        </div>
        <Button type="button" size="icon" variant="outline" title={task.completed ? "Restore task" : "Complete task"} aria-label={task.completed ? "Restore task" : "Complete task"} onClick={onToggle}>
          {task.completed ? <RotateCcw className="size-4" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          {formatDate(task.due_date)}
        </span>
        {task.category ? (
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ backgroundColor: task.category.color }} />
            {task.category.name}
          </span>
        ) : null}
      </div>

      {task.subtasks.length ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <span
              className="block h-2 rounded-full bg-primary"
              style={{ width: `${Math.round((completedSubtasks / task.subtasks.length) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {task.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-1 border-t border-border pt-3">
        <Button type="button" variant="ghost" size="icon" title="Edit task" aria-label="Edit task" onClick={onEdit}>
          <Edit3 className="size-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" title="Duplicate task" aria-label="Duplicate task" onClick={onDuplicate}>
          <Copy className="size-4" aria-hidden="true" />
        </Button>
        {task.status !== "archived" ? (
          <Button type="button" variant="ghost" size="icon" title="Archive task" aria-label="Archive task" onClick={onArchive}>
            <Archive className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon" title="Delete task" aria-label="Delete task" onClick={onDelete}>
          <Trash2 className="size-4 text-rose-500" aria-hidden="true" />
        </Button>
      </div>
    </motion.article>
  );
}
