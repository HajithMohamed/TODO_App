"use client";

import { create } from "zustand";

import type { TaskFilterState } from "@/types/task";

const defaultFilters: TaskFilterState = {
  query: "",
  priority: "all",
  status: "all",
  categoryId: "all",
  tag: "",
  due: "all",
  created: "all",
};

type TaskViewStore = {
  filters: TaskFilterState;
  setFilter: <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => void;
  resetFilters: () => void;
};

export const useTaskViewStore = create<TaskViewStore>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
