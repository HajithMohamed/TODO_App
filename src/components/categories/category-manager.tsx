"use client";

import { Edit3, FolderPlus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useTasks } from "@/hooks/use-tasks";
import { categoryColors } from "@/lib/constants";
import { categorySchema } from "@/lib/validations/task";
import type { Category } from "@/types/database";
import type { CategoryFormValues } from "@/types/task";

export function CategoryManager() {
  const { categories, isLoading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const { tasks } = useTasks({ includeArchived: true });
  const [editing, setEditing] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(categoryColors[0]);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: categoryColors[0] },
  });

  const counts = useMemo(() => {
    return tasks.reduce((map, task) => {
      if (task.category_id) map.set(task.category_id, (map.get(task.category_id) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
  }, [tasks]);

  const submit = handleSubmit(async (values) => {
    if (editing) {
      await updateCategory(editing.id, values);
      setEditing(null);
    } else {
      await createCategory(values);
    }
    setSelectedColor(categoryColors[0]);
    reset({ name: "", color: categoryColors[0] });
  });

  const beginEdit = (category: Category) => {
    setEditing(category);
    setSelectedColor(category.color);
    reset({ name: category.name, color: category.color });
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Categories</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Organize your work</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Create color-coded areas for projects, routines, and life admin.</p>
      </div>

      <Card className="p-5">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category-name">
                Category name
              </label>
              <Input id="category-name" placeholder="Marketing" {...register("name")} />
              {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category-color">
                Color
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-color"
                  type="color"
                  className="h-11 w-16 p-1"
                  value={selectedColor}
                  onChange={(event) => {
                    setSelectedColor(event.target.value);
                    setValue("color", event.target.value, { shouldValidate: true });
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {categoryColors.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      aria-label={`Use ${swatch}`}
                      className="size-6 rounded-full border border-border"
                      style={{ backgroundColor: swatch, outline: selectedColor === swatch ? "2px solid var(--foreground)" : "none" }}
                      onClick={() => {
                        setSelectedColor(swatch);
                        setValue("color", swatch, { shouldValidate: true });
                      }}
                    />
                  ))}
                </div>
              </div>
              {errors.color ? <p className="text-xs text-rose-500">{errors.color.message}</p> : null}
            </div>
          </div>
          <div className="flex items-end gap-2">
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setSelectedColor(categoryColors[0]);
                  reset({ name: "", color: categoryColors[0] });
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {editing ? <Save className="size-4" aria-hidden="true" /> : <FolderPlus className="size-4" aria-hidden="true" />}
              {editing ? "Save category" : "Add category"}
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <EmptyState icon={FolderPlus} title="Categories could not load" description={error} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="size-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <div>
                    <h2 className="font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{counts.get(category.id) ?? 0} tasks</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Edit category" onClick={() => beginEdit(category)}>
                    <Edit3 className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete category"
                    onClick={() => {
                      if (window.confirm("Delete this category? Tasks will keep their history but lose the category.")) {
                        void deleteCategory(category.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-rose-500" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderPlus} title="No categories yet" description="Add your first category to keep tasks easier to scan." />
      )}
    </section>
  );
}
