import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { CategoryFormValues } from "@/types/task";

type Client = SupabaseClient<Database>;

export async function fetchCategories(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(supabase: Client, userId: string, values: CategoryFormValues) {
  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: userId, name: values.name, color: values.color })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(supabase: Client, id: string, values: CategoryFormValues) {
  const { data, error } = await supabase
    .from("categories")
    .update({ name: values.name, color: values.color })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(supabase: Client, id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
