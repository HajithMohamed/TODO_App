"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  createCategory as createCategoryRecord,
  deleteCategory as deleteCategoryRecord,
  fetchCategories,
  updateCategory as updateCategoryRecord,
} from "@/services/category-service";
import type { Category } from "@/types/database";
import type { CategoryFormValues } from "@/types/task";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
      setError("Sign in to manage categories.");
      setIsLoading(false);
      return;
    }

    setUserId(user.id);
    setIsLoading(true);

    try {
      setCategories(await fetchCategories(supabase, user.id));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`categories:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories", filter: `user_id=eq.${userId}` },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  const createCategory = useCallback(
    async (values: CategoryFormValues) => {
      const supabase = createClient();
      if (!supabase || !userId) return;
      await createCategoryRecord(supabase, userId, values);
      toast.success("Category created");
      await refresh();
    },
    [refresh, userId],
  );

  const updateCategory = useCallback(
    async (id: string, values: CategoryFormValues) => {
      const supabase = createClient();
      if (!supabase) return;
      await updateCategoryRecord(supabase, id, values);
      toast.success("Category updated");
      await refresh();
    },
    [refresh],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const supabase = createClient();
      if (!supabase) return;
      await deleteCategoryRecord(supabase, id);
      toast.success("Category deleted");
      await refresh();
    },
    [refresh],
  );

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh,
  };
}
