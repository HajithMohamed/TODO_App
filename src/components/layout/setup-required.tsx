import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SetupRequired() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="surface max-w-xl rounded-2xl p-8">
        <Database className="mb-5 size-10 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Connect Supabase to open the workspace</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add your Supabase URL and publishable key to the environment variables, then run the database migration in
          `supabase/migrations`.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              Open Supabase
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
