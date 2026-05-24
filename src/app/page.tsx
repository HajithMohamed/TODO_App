import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, LayoutDashboard, Lock, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appName } from "@/lib/constants";

const previewTasks = [
  { title: "Review launch checklist", status: "In progress", priority: "High", color: "bg-amber-500" },
  { title: "Ship dashboard polish", status: "Today", priority: "Urgent", color: "bg-rose-500" },
  { title: "Plan customer interviews", status: "Tomorrow", priority: "Medium", color: "bg-sky-500" },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${appName} home`}>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            T
          </span>
          <span className="text-lg font-semibold">{appName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Start
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </nav>

      <section className="soft-grid relative mx-auto flex min-h-[86svh] w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="absolute inset-x-4 bottom-0 top-28 -z-10 overflow-hidden rounded-[2rem] border border-border bg-card/55 shadow-2xl sm:inset-x-6 lg:inset-x-8">
          <div className="grid h-full grid-cols-1 gap-4 p-5 opacity-90 md:grid-cols-[240px_1fr]">
            <aside className="hidden rounded-3xl border border-border bg-background/80 p-4 md:block">
              <div className="mb-8 h-10 rounded-2xl bg-primary/15" />
              {["Dashboard", "My Tasks", "Completed", "Categories"].map((item, index) => (
                <div key={item} className="mb-3 flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className={index === 0 ? "font-medium" : "text-muted-foreground"}>{item}</span>
                </div>
              ))}
            </aside>
            <div className="grid gap-4 p-2 md:grid-rows-[auto_1fr]">
              <div className="grid gap-4 sm:grid-cols-3">
                {["82% productive", "12 completed", "3 overdue"].map((item) => (
                  <div key={item} className="rounded-3xl border border-border bg-background/80 p-5">
                    <p className="text-sm text-muted-foreground">This week</p>
                    <p className="mt-2 text-2xl font-semibold">{item}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-3xl border border-border bg-background/80 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Today</h2>
                    <Badge>Live sync</Badge>
                  </div>
                  <div className="space-y-3">
                    {previewTasks.map((task) => (
                      <div key={task.title} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                          <span className={`size-3 rounded-full ${task.color}`} />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.status}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{task.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-background/80 p-5">
                  <h2 className="text-lg font-semibold">Focus streak</h2>
                  <div className="mt-6 flex h-44 items-end gap-2">
                    {[35, 58, 46, 80, 72, 92, 64].map((height, index) => (
                      <span
                        key={height + index}
                        className="flex-1 rounded-t-xl bg-primary/80"
                        style={{ height: `${height}%` }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <Badge className="mb-5 bg-card/90">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Supabase realtime productivity
          </Badge>
          <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">{appName}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            A polished task workspace with secure accounts, real-time updates, categories, deadlines, analytics, and a UI
            that stays calm when the work gets busy.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Create workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Open existing account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/60 py-12">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Lock, title: "RLS secured", copy: "Every row belongs to its owner." },
            { icon: Zap, title: "Realtime", copy: "Changes sync across tabs and devices." },
            { icon: LayoutDashboard, title: "Analytics", copy: "Track completion, urgency, and categories." },
            { icon: CalendarClock, title: "Deadlines", copy: "Spot overdue and upcoming work fast." },
          ].map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-border bg-background p-5">
              <feature.icon className="mb-4 size-6 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.7fr] lg:px-8">
        <div>
          <Badge className="mb-4">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Production ready
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Built for a portfolio and a real product roadmap.</h2>
        </div>
        <p className="text-muted-foreground">
          The project includes App Router architecture, typed Supabase clients, auth screens, protected routes, realtime task
          synchronization, RLS SQL, Netlify configuration, and deployment documentation.
        </p>
      </section>
    </main>
  );
}
