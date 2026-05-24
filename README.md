# TaskFlow

A modern production-ready task management web app built with Next.js App Router, React, TypeScript, Supabase, Tailwind CSS, and Netlify deployment settings.

## Features

- Supabase Auth with email/password registration, login, logout, password reset, email verification, persistent sessions, and optional Google/GitHub OAuth buttons.
- Protected workspace routes with server-side session checks and middleware session refresh.
- Personal task CRUD: create, edit, delete, complete, restore, duplicate, archive, notes, descriptions, subtasks, tags, priorities, statuses, categories, and due dates.
- Dashboard analytics with Recharts: weekly productivity, completed vs pending, category distribution, upcoming deadlines, recent activity, and a Pomodoro timer.
- Advanced search and filtering by priority, category, status, due date, tags, and created date.
- Supabase Realtime subscriptions for tasks, subtasks, task tags, categories, and activity logs.
- Dark/light theme with persisted preference.
- Responsive SaaS-style UI with skeleton loading, toast notifications, empty states, modal forms, and keyboard-friendly controls.
- PostgreSQL schema with RLS policies and explicit Data API grants.
- Netlify-ready `netlify.toml`.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Realtime
- React Hook Form and Zod
- Recharts
- Framer Motion-ready dependency set
- Sonner toasts
- Zustand UI filter store

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for newer Supabase projects. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a legacy fallback. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

## Supabase Setup

1. Create a Supabase project.
2. Add the app URL in Supabase Auth:
   - Site URL: `http://localhost:3000` for local development.
   - Production URL after Netlify deploy.
   - Redirect URLs: `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password`, and production equivalents.
3. Run `supabase/migrations/0001_taskflow_schema.sql` in the Supabase SQL Editor.
4. Enable email confirmation if desired.
5. Optional OAuth: enable Google and GitHub providers in Supabase Auth, then add each provider's credentials.

The SQL migration creates `users`, `tasks`, `categories`, `subtasks`, `tags`, `task_tags`, and `activity_logs`, enables RLS on all exposed tables, grants authenticated users only the privileges they need, and adds relevant tables to Supabase Realtime.

## Folder Structure

```bash
src/
  app/                 # App Router pages, route handler, layouts, middleware
  components/          # UI, auth, dashboard, layout, task, category, profile components
  hooks/               # Reusable client hooks for tasks, categories, activity, debounce
  lib/                 # Env, constants, utilities, validation, Supabase clients
  services/            # Supabase data access services
  store/               # Small Zustand UI store
  types/               # Database and task domain types
supabase/migrations/   # Production database schema and RLS
docs/                  # Deployment guide
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start built app
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Netlify Deployment

This repo includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

Push the repo to GitHub, import it in Netlify, add the environment variables, and deploy. See `docs/DEPLOYMENT.md` for the full checklist.

## Security Notes

- All user-owned tables use Row Level Security.
- Policies are scoped to `authenticated` users and compare row ownership to `auth.uid()`.
- Client code only uses publishable/anon Supabase keys.
- The service role key is documented for admin workflows only and is not imported anywhere in the app.
- Frontend forms use Zod validation before Supabase writes.
- Database constraints enforce valid priorities, statuses, colors, title lengths, and ownership relationships.

## Future Improvements

- Calendar view and reminder notifications.
- PWA offline queue.
- Shared workspaces and assigned team tasks.
- Profile image upload through Supabase Storage.
- Server Actions for selected mutations when the product needs server-side audit or rate limiting.
