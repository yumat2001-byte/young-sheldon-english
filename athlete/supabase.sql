-- Athlete OS database schema
create extension if not exists pgcrypto;

create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_on date not null default current_date,
  type text not null check (type in ('RUN','RACE','WEIGHT','TECH','CONDITION','PROSTHETIC')),
  raw_text text not null,
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.performance_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_on date not null,
  event text not null,
  value numeric not null,
  unit text not null,
  wind numeric,
  is_competition boolean not null default false,
  is_official boolean not null default false,
  source_log_id uuid references public.training_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.strength_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_on date not null,
  exercise text not null,
  weight_kg numeric,
  reps integer,
  sets integer default 1,
  source_log_id uuid references public.training_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.technique_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_on date not null,
  category text,
  observation text not null,
  interpretation text,
  source_log_id uuid references public.training_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.training_logs enable row level security;
alter table public.performance_results enable row level security;
alter table public.strength_sets enable row level security;
alter table public.technique_notes enable row level security;

create policy "own training logs" on public.training_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own performance results" on public.performance_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own strength sets" on public.strength_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own technique notes" on public.technique_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists training_logs_user_date_idx on public.training_logs(user_id, performed_on desc);
create index if not exists performance_user_event_date_idx on public.performance_results(user_id, event, performed_on desc);
create index if not exists strength_user_exercise_date_idx on public.strength_sets(user_id, exercise, performed_on desc);