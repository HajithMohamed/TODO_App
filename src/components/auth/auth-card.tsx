import Link from "next/link";

import { appName } from "@/lib/constants";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="soft-grid flex min-h-screen items-center justify-center px-4 py-10">
      <section className="surface w-full max-w-md rounded-2xl p-6 sm:p-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-3" aria-label={`${appName} home`}>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            T
          </span>
          <span className="text-lg font-semibold">{appName}</span>
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </section>
    </main>
  );
}
