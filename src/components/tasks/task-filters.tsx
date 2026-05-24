"use client";

import { useEffect, useState } from "react";
import { FilterX, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { priorityOptions, statusOptions } from "@/lib/constants";
import { useTaskViewStore } from "@/store/use-task-view-store";
import type { Category } from "@/types/database";

export function TaskFilters({
  categories,
  resultCount,
  onCreate,
}: {
  categories: Category[];
  resultCount: number;
  onCreate: () => void;
}) {
  const { filters, setFilter, resetFilters } = useTaskViewStore();
  const [query, setQuery] = useState(filters.query);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    setFilter("query", debouncedQuery);
  }, [debouncedQuery, setFilter]);

  return (
    <section className="surface rounded-2xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks and descriptions"
            aria-label="Search tasks"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:flex">
          <Select aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilter("priority", event.target.value as typeof filters.priority)}>
            <option value="all">All priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilter("status", event.target.value as typeof filters.status)}>
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by category"
            value={filters.categoryId}
            onChange={(event) => setFilter("categoryId", event.target.value as typeof filters.categoryId)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by due date" value={filters.due} onChange={(event) => setFilter("due", event.target.value as typeof filters.due)}>
            <option value="all">Any due date</option>
            <option value="today">Due today</option>
            <option value="week">Due this week</option>
            <option value="overdue">Overdue</option>
            <option value="none">No due date</option>
          </Select>
          <Select
            aria-label="Filter by created date"
            value={filters.created}
            onChange={(event) => setFilter("created", event.target.value as typeof filters.created)}
          >
            <option value="all">Any created date</option>
            <option value="today">Created today</option>
            <option value="week">Created this week</option>
            <option value="month">Created this month</option>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <span className="text-sm text-muted-foreground">{resultCount} shown</span>
          <Button type="button" variant="outline" size="icon" title="Clear filters" aria-label="Clear filters" onClick={resetFilters}>
            <FilterX className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        </div>
      </div>
    </section>
  );
}
