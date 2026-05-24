import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose new password",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Set a fresh password for your account."
      footer="You can return to your dashboard after this is saved."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
