"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitBranch, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";

type Values = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Add Supabase environment variables to enable sign in.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back");
    router.replace("/dashboard");
    router.refresh();
  });

  const signInWithProvider = async (provider: "google" | "github") => {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Add Supabase environment variables to enable social login.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildSiteUrl("/auth/callback?next=/dashboard"),
      },
    });

    if (error) toast.error(error.message);
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        {errors.email ? <p className="text-xs text-rose-500">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="text-xs text-rose-500">{errors.password.message}</p> : null}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Mail className="size-4" aria-hidden="true" />
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={() => void signInWithProvider("google")}>
          Google
        </Button>
        <Button type="button" variant="outline" onClick={() => void signInWithProvider("github")}>
          <GitBranch className="size-4" aria-hidden="true" />
          GitHub
        </Button>
      </div>
    </form>
  );
}
