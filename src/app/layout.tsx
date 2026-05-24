import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { appName } from "@/lib/constants";
import { siteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} - Modern task management`,
    template: `%s - ${appName}`,
  },
  description: "A secure Supabase-powered productivity workspace for teams and personal task planning.",
  applicationName: appName,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121513" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
