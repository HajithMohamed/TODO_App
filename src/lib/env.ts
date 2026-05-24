const defaultSiteUrl = "http://localhost:3000";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const siteUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || (process.env.URL ? `https://${process.env.URL}` : defaultSiteUrl);

export function buildSiteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
