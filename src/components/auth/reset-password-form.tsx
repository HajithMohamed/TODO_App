"use client";

import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validations/auth";

type Values = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Add Supabase environment variables to update passwords.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated");
    router.replace("/dashboard");
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          New password
        </label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password ? <p className="text-xs text-rose-500">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Confirm password
        </label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        {errors.confirmPassword ? <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p> : null}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        <KeyRound className="size-4" aria-hidden="true" />
        {isLoading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
