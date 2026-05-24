import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function logActivity(
  supabase: Client,
  input: { userId: string; taskId?: string | null; action: string; metadata?: Json },
) {
  await supabase.from("activity_logs").insert({
    user_id: input.userId,
    task_id: input.taskId ?? null,
    action: input.action,
    metadata: input.metadata ?? {},
  });
}

export async function fetchRecentActivity(supabase: Client, userId: string, limit = 8) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
