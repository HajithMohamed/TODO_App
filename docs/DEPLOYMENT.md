# Deployment Guide

## 1. Local Verification

Run:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## 2. Supabase Production Setup

1. Create or open your Supabase project.
2. Run `supabase/migrations/0001_taskflow_schema.sql` in the SQL Editor.
3. In Authentication settings, add:
   - Site URL: your Netlify production URL.
   - Redirect URLs:
     - `https://your-site.netlify.app/auth/callback`
     - `https://your-site.netlify.app/reset-password`
4. Copy the project URL and publishable key from the Supabase dashboard.
5. Keep the service role key server-only. This app does not require it at runtime.

## 3. GitHub

Push this repository to GitHub. Netlify can deploy directly from the Git repository and will create deploy previews for branches and pull requests.

## 4. Netlify

1. In Netlify, choose **Add new site**.
2. Import the GitHub repository.
3. Use the included settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `22`
4. Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

5. Deploy.

Netlify's current Next.js platform support uses the OpenNext adapter automatically, so this project does not pin `@netlify/plugin-nextjs`.

## 5. Post-Deploy Checks

- Register a new user and confirm the email if email verification is enabled.
- Create, edit, complete, duplicate, archive, and delete a task.
- Open the app in two tabs and confirm realtime task updates.
- Verify the dashboard charts update after task changes.
- Test password reset with the production redirect URL.
- Confirm dark/light mode persists after refresh.

## 6. Optional OAuth

Enable Google and GitHub in Supabase Auth providers, then add each provider's callback URL from Supabase to the provider console. The app already includes Google and GitHub login buttons.
