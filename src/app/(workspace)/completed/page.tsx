import type { Metadata } from "next";

import { TaskBoard } from "@/components/tasks/task-board";

export const metadata: Metadata = {
  title: "Completed Tasks",
};

export default function CompletedTasksPage() {
  return (
    <TaskBoard
      mode="completed"
      title="Completed Tasks"
      description="Review finished work, restore anything that needs another pass, or duplicate a proven task."
    />
  );
}
