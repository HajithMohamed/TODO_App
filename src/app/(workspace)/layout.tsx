import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SetupRequired } from "@/components/layout/setup-required";
import { createClient } from "@/lib/supabase/server";
import { fetchProfile } from "@/services/profile-service";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  if (!supabase) {
    return <SetupRequired />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = null;
  try {
    profile = await fetchProfile(supabase, user.id);
  } catch {
    profile = null;
  }

  return (
    <AppShell
      user={{
        name: profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        email: profile?.email ?? user.email ?? null,
        avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
