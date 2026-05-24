import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function fetchProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: Client,
  userId: string,
  values: { name: string; email: string; avatar_url?: string | null },
) {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: userId,
      name: values.name,
      email: values.email,
      avatar_url: values.avatar_url || null,
    }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
