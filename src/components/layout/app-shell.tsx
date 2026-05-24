"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { appName, navItems, quickNavItems } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

type ShellUser = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

function SidebarContent({ user, onNavigate }: { user: ShellUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2" onClick={onNavigate}>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          T
        </span>
        <div>
          <p className="font-semibold">{appName}</p>
          <p className="text-xs text-muted-foreground">Personal workspace</p>
        </div>
      </Link>

      <nav className="mt-8 flex-1 space-y-1" aria-label="Workspace navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border pt-4">
        {quickNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
        <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-sm font-semibold">
            {getInitials(user.name, user.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name || "TaskFlow user"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-card/70 p-4 backdrop-blur lg:block">
        <SidebarContent user={user} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="surface absolute inset-y-0 left-0 w-[min(320px,85vw)] rounded-r-3xl p-4">
            <div className="mb-4 flex justify-end">
              <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium lg:hidden">{appName}</p>
              <p className="hidden text-sm text-muted-foreground lg:block">Stay close to the work that matters today.</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" title="Sign out" aria-label="Sign out" onClick={() => void logout()}>
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
