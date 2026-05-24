"use client";

import { Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validations/task";
import { updateProfile } from "@/services/profile-service";

type Values = z.infer<typeof profileSchema>;

export function SettingsForm({
  userId,
  name,
  email,
  avatarUrl,
}: {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name, email, avatar_url: avatarUrl },
  });

  const submit = handleSubmit(async (values) => {
    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase is not configured.");
      return;
    }

    const cleanAvatar = values.avatar_url || null;
    const { error: authError } = await supabase.auth.updateUser({
      email: values.email,
      data: {
        full_name: values.name,
        avatar_url: cleanAvatar,
      },
    });

    if (authError) {
      toast.error(authError.message);
      return;
    }

    try {
      await updateProfile(supabase, userId, {
        name: values.name,
        email: values.email,
        avatar_url: cleanAvatar,
      });
      toast.success("Profile updated");
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Profile could not be updated.");
    }
  });

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Profile Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Keep the profile information tied to this workspace current.</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <UserRound className="size-6 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">Account details</h2>
            <p className="text-sm text-muted-foreground">Email changes may require confirmation.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-name">
                Name
              </label>
              <Input id="profile-name" autoComplete="name" {...register("name")} />
              {errors.name ? <p className="text-xs text-rose-500">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-email">
                Email
              </label>
              <Input id="profile-email" type="email" autoComplete="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-rose-500">{errors.email.message}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-avatar">
              Avatar image URL
            </label>
            <Input id="profile-avatar" type="url" placeholder="https://..." {...register("avatar_url")} />
            {errors.avatar_url ? <p className="text-xs text-rose-500">{errors.avatar_url.message}</p> : null}
          </div>
          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="size-4" aria-hidden="true" />
              {isSubmitting ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
