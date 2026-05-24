import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { SettingsForm } from "@/components/profile/settings-form";
import { createClient } from "@/lib/supabase/server";
import { fetchProfile } from "@/services/profile-service";

export const metadata: Metadata = {
  title: "Profile Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profile = null;
  try {
    profile = await fetchProfile(supabase, user.id);
  } catch {
    profile = null;
  }

  return (
    <SettingsForm
      userId={user.id}
      name={profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""}
      email={profile?.email ?? user.email ?? ""}
      avatarUrl={profile?.avatar_url ?? user.user_metadata?.avatar_url ?? ""}
    />
  );
}
