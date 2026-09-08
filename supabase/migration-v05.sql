-- ============================================================
-- AVE Forum — migration v0.5
-- Adds: professional groups with membership, role badges,
-- specialty field, and group-scoped discussions.
--
-- Run ONCE in the Supabase SQL editor, after migration-v04.sql.
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profile: specialty and professional badges
-- ------------------------------------------------------------
alter table public.profiles add column if not exists specialty     text;
alter table public.profiles add column if not exists is_verified   boolean not null default false;
alter table public.profiles add column if not exists is_mentor     boolean not null default false;
alter table public.profiles add column if not exists is_editor     boolean not null default false;
alter table public.profiles add column if not exists is_founder    boolean not null default false;

-- ------------------------------------------------------------
-- 2. Groups
-- ------------------------------------------------------------
create table if not exists public.groups (
  id          text primary key,
  name        text not null,
  description text not null,
  pillar      text,
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.groups enable row level security;

drop policy if exists "groups readable" on public.groups;
create policy "groups readable" on public.groups for select using (true);

drop policy if exists "moderators manage groups" on public.groups;
create policy "moderators manage groups" on public.groups for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

insert into public.groups (id, name, description, pillar) values
  ('residents',  'Residents Network',            'A peer community for EM residents across Africa to share cases, exam preparation and rotation advice.', 'knowledge'),
  ('nurses',     'Nurses in Emergency Care',     'Triage, resuscitation nursing and leadership discussion for emergency nurses.',                          'knowledge'),
  ('ems',        'EMS and Pre-hospital Providers','Dispatch, transport and field protocol discussion for paramedics and EMS leadership.',                   'knowledge'),
  ('trauma',     'Trauma Special Interest Group','Case-based trauma discussion and guideline review for trauma-focused clinicians.',                        'knowledge'),
  ('women',      'Women in EM',                  'A community supporting the careers and voices of women in African emergency medicine.',                   'hervoice'),
  ('digital',    'Digital Health Innovators',    'Builders and researchers working on emergency-care technology across the continent.',                     'innovation'),
  ('research',   'Research Collaborative',       'Protocol review, analysis support and co-authorship across African institutions.',                        'research'),
  ('mentorship', 'Mentorship Circle',            'Structured pairing between established professionals and those early in their careers.',                  'mentorship')
on conflict (id) do update set name = excluded.name, description = excluded.description, pillar = excluded.pillar;

-- ------------------------------------------------------------
-- 3. Group membership
-- ------------------------------------------------------------
create table if not exists public.group_members (
  group_id  text not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

drop policy if exists "memberships readable" on public.group_members;
create policy "memberships readable" on public.group_members for select to authenticated using (true);

drop policy if exists "join groups" on public.group_members;
create policy "join groups" on public.group_members for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "leave groups" on public.group_members;
create policy "leave groups" on public.group_members for delete to authenticated
  using (auth.uid() = user_id);

-- Real member counts. No invented numbers anywhere on the platform.
create or replace view public.group_counts as
  select g.id, g.name, g.description, g.pillar,
         (select count(*) from public.group_members m where m.group_id = g.id) as members
  from public.groups g;

-- ------------------------------------------------------------
-- 4. Group-scoped discussion
-- ------------------------------------------------------------
alter table public.posts add column if not exists group_id text references public.groups(id) on delete cascade;
alter table public.posts add column if not exists title    text;
alter table public.posts alter column pillar drop not null;

create index if not exists posts_group_idx on public.posts (group_id, created_at desc);

-- ------------------------------------------------------------
-- 5. Directory search helper
-- ------------------------------------------------------------
create index if not exists profiles_country_idx   on public.profiles (country);
create index if not exists profiles_role_idx      on public.profiles (role);
create index if not exists profiles_specialty_idx on public.profiles (specialty);

-- ------------------------------------------------------------
-- 6. Realtime
-- ------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.group_members;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 7. Mark the founder (run with the founder's own email):
--   update public.profiles set is_founder = true, is_verified = true
--   where id = (select id from auth.users where email = 'founder@example.com');
-- ------------------------------------------------------------
