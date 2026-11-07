import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema, resetPasswordSchema } from "./auth";
import { categorySchema, taskSchema } from "./task";

const validTask = {
  title: "Prepare sprint demo",
  priority: "high",
  status: "pending",
  tags: "work, demo",
  subtasks: [{ title: "Record a walkthrough" }],
};

describe("taskSchema", () => {
  it("accepts a valid task", () => {
    expect(taskSchema.safeParse(validTask).success).toBe(true);
  });

  it("trims the title and rejects one shorter than 2 characters", () => {
    const result = taskSchema.safeParse({ ...validTask, title: "  a  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Give this task a clear title.");
  });

  it("rejects an unknown priority or status", () => {
    expect(taskSchema.safeParse({ ...validTask, priority: "critical" }).success).toBe(false);
    expect(taskSchema.safeParse({ ...validTask, status: "done" }).success).toBe(false);
  });

  it("rejects a subtask without a title", () => {
    const result = taskSchema.safeParse({ ...validTask, subtasks: [{ title: "   " }] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Subtask title is required.");
  });

  it("limits tags to 240 characters", () => {
    expect(taskSchema.safeParse({ ...validTask, tags: "x".repeat(241) }).success).toBe(false);
  });
});

describe("categorySchema", () => {
  it("accepts a six-digit hex colour", () => {
    expect(categorySchema.safeParse({ name: "Work", color: "#1A2b3C" }).success).toBe(true);
  });

  it("rejects short or named colours", () => {
    expect(categorySchema.safeParse({ name: "Work", color: "#FFF" }).success).toBe(false);
    expect(categorySchema.safeParse({ name: "Work", color: "red" }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  it("rejects an invalid email at login", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret12" }).success).toBe(false);
  });

  it("requires matching passwords at registration", () => {
    const result = registerSchema.safeParse({
      name: "Nimal Perera",
      email: "nimal@example.com",
      password: "secret12",
      confirmPassword: "secret13",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    expect(result.error?.issues[0]?.message).toBe("Passwords do not match.");
  });

  it("requires at least 8 characters when resetting a password", () => {
    expect(resetPasswordSchema.safeParse({ password: "short12", confirmPassword: "short12" }).success).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ password: "longer123", confirmPassword: "longer123" }).success,
    ).toBe(true);
  });
});
