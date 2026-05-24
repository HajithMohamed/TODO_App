"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="surface max-w-lg rounded-2xl p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 size-10 text-amber-500" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Something went sideways</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message || "The app could not load this view."}</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </section>
    </main>
  );
}
