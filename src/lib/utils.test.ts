import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TaskWithDetails } from "../types/database";
import { calculateStats, getInitials, isOverdue, normalizeTag, priorityLabel, statusLabel } from "./utils";

function makeTask(overrides: Partial<TaskWithDetails> = {}): TaskWithDetails {
  return {
    id: "task-1",
    user_id: "user-1",
    title: "Write report",
    description: null,
    priority: "medium",
    status: "pending",
    due_date: null,
    completed: false,
    completed_at: null,
    category_id: null,
    notes: null,
    created_at: "2026-05-01T09:00:00.000Z",
    updated_at: "2026-05-01T09:00:00.000Z",
    category: null,
    subtasks: [],
    tags: [],
    ...overrides,
  };
}

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is true for an open task whose due date has passed", () => {
    expect(isOverdue(makeTask({ due_date: "2026-05-18" }))).toBe(true);
  });

  it("is false for a task due today", () => {
    expect(isOverdue(makeTask({ due_date: "2026-05-20" }))).toBe(false);
  });

  it("is false for a task due in the future", () => {
    expect(isOverdue(makeTask({ due_date: "2026-05-25" }))).toBe(false);
  });

  it("is false for a task without a due date", () => {
    expect(isOverdue(makeTask({ due_date: null }))).toBe(false);
  });

  it("is false for completed and archived tasks, even when late", () => {
    expect(isOverdue(makeTask({ due_date: "2026-05-01", completed: true }))).toBe(false);
    expect(isOverdue(makeTask({ due_date: "2026-05-01", status: "completed" }))).toBe(false);
    expect(isOverdue(makeTask({ due_date: "2026-05-01", status: "archived" }))).toBe(false);
  });
});

describe("calculateStats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zeros for an empty list", () => {
    expect(calculateStats([])).toEqual({
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      archived: 0,
      productivity: 0,
    });
  });

  it("counts each status, leaves archived tasks out of the total and rounds productivity", () => {
    const tasks = [
      makeTask({ id: "1", status: "completed", completed: true }),
      makeTask({ id: "2", status: "pending", due_date: "2026-05-10" }),
      makeTask({ id: "3", status: "in_progress" }),
      makeTask({ id: "4", status: "archived" }),
    ];

    expect(calculateStats(tasks)).toEqual({
      total: 3,
      completed: 1,
      pending: 1,
      inProgress: 1,
      overdue: 1,
      archived: 1,
      productivity: 33,
    });
  });
});

describe("label and formatting helpers", () => {
  it("normalizes tags to lowercase kebab-case of at most 32 characters", () => {
    expect(normalizeTag("  Deep Work  ")).toBe("deep-work");
    expect(normalizeTag("a".repeat(40))).toHaveLength(32);
  });

  it("builds initials from a name, falling back to the email", () => {
    expect(getInitials("Nimal Perera")).toBe("NP");
    expect(getInitials(null, "kasun.silva@example.com")).toBe("KS");
    expect(getInitials()).toBe("U");
  });

  it("labels priorities and statuses for display", () => {
    expect(priorityLabel("urgent")).toBe("Urgent");
    expect(statusLabel("in_progress")).toBe("In Progress");
  });
});
