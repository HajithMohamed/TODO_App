"use client";

import { useCallback, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { fetchRecentActivity } from "@/services/activity-service";
import type { ActivityLog } from "@/types/database";

export function useActivity(limit = 8) {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setUserId(user.id);

    try {
      setActivity(await fetchRecentActivity(supabase, user.id, limit));
    } catch {
      setActivity([]);
    }
  }, [limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`activity:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs", filter: `user_id=eq.${userId}` }, () =>
        void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  return activity;
}
