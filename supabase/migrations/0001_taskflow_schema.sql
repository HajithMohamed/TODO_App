create extension if not exists pgcrypto;

create schema if not exists app_private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('pending', 'in_progress', 'completed', 'archived');
  end if;
end
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 50),
  color text not null default '#14b8a6' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  category_id uuid references public.categories(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 32),
  color text not null default '#64748b' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists tasks_user_due_date_idx on public.tasks(user_id, due_date);
create index if not exists tasks_user_priority_idx on public.tasks(user_id, priority);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists tags_user_id_idx on public.tags(user_id);
create index if not exists task_tags_user_task_idx on public.task_tags(user_id, task_id);
create index if not exists activity_logs_user_timestamp_idx on public.activity_logs(user_id, timestamp desc);

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.users.name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function app_private.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function app_private.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function app_private.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.tags enable row level security;
alter table public.task_tags enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "Users can view their profile" on public.users;
create policy "Users can view their profile"
on public.users for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert their profile" on public.users;
create policy "Users can insert their profile"
on public.users for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their profile" on public.users;
create policy "Users can update their profile"
on public.users for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can manage their categories" on public.categories;
create policy "Users can manage their categories"
on public.categories for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their tasks" on public.tasks;
create policy "Users can manage their tasks"
on public.tasks for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    category_id is null
    or exists (
      select 1 from public.categories
      where categories.id = tasks.category_id
      and categories.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Users can manage subtasks for their tasks" on public.subtasks;
create policy "Users can manage subtasks for their tasks"
on public.subtasks for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id
    and tasks.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tasks
    where tasks.id = subtasks.task_id
    and tasks.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can manage their tags" on public.tags;
create policy "Users can manage their tags"
on public.tags for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their task tags" on public.task_tags;
create policy "Users can manage their task tags"
on public.task_tags for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tasks
    where tasks.id = task_tags.task_id
    and tasks.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tasks
    where tasks.id = task_tags.task_id
    and tasks.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.tags
    where tags.id = task_tags.tag_id
    and tags.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can read their activity logs" on public.activity_logs;
create policy "Users can read their activity logs"
on public.activity_logs for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their activity logs" on public.activity_logs;
create policy "Users can create their activity logs"
on public.activity_logs for insert
to authenticated
with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.users,
  public.categories,
  public.tasks,
  public.subtasks,
  public.tags,
  public.task_tags,
  public.activity_logs
to authenticated;

alter table public.tasks replica identity full;
alter table public.subtasks replica identity full;
alter table public.categories replica identity full;
alter table public.task_tags replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.tasks;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.subtasks;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.categories;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.task_tags;
    exception when duplicate_object then null;
    end;
  end if;
end
$$;
