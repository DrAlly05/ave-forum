-- ============================================================
-- AVE Forum — database schema
-- Run this once in the Supabase SQL editor.
--
-- Covers Kimario's Sections 5 (profiles), 6 (discussion + direct
-- messages), 7 (notifications) and 8 (registration).
--
-- Every table has row-level security ON. The anon key in the
-- frontend is public by design; these policies are what actually
-- protect the data. Do not weaken them.
-- ============================================================

-- ------------------------------------------------------------
-- SECTION 8: public registration (no account needed)
-- ------------------------------------------------------------
create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  country     text,
  role        text,
  interest    text,
  message     text,
  created_at  timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Anyone may register. Nobody may read the list from the browser;
-- export it from the Supabase dashboard or with the service role.
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register"
  on public.registrations for insert
  to anon, authenticated
  with check (true);

-- ------------------------------------------------------------
-- SECTION 5: profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  country         text,
  role            text,
  institution     text,
  bio             text,
  is_country_rep  boolean not null default false,
  is_moderator    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by members" on public.profiles;
create policy "profiles readable by members"
  on public.profiles for select to authenticated using (true);

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- A profile row is created automatically on sign-up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- SECTION 6a: pillar discussion rooms
-- ------------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  pillar      text not null check (pillar in
                ('clinical','research','leadership','community','frontline','innovation','hervoice')),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 4000),
  parent_id   uuid references public.posts(id) on delete cascade,
  is_removed  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists posts_pillar_created_idx on public.posts (pillar, created_at);
create index if not exists posts_parent_idx on public.posts (parent_id);

alter table public.posts enable row level security;

drop policy if exists "members read posts" on public.posts;
create policy "members read posts"
  on public.posts for select to authenticated using (is_removed = false);

drop policy if exists "members write posts" on public.posts;
create policy "members write posts"
  on public.posts for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "authors edit own posts" on public.posts;
create policy "authors edit own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- Moderators may remove any post.
drop policy if exists "moderators remove posts" on public.posts;
create policy "moderators remove posts"
  on public.posts for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

-- ------------------------------------------------------------
-- SECTION 6b: direct messages
-- ------------------------------------------------------------
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  recipient_id  uuid not null references public.profiles(id) on delete cascade,
  body          text not null check (char_length(body) between 1 and 4000),
  read_at       timestamptz,
  created_at    timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists messages_pair_idx on public.messages (sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

-- A member sees only conversations they are part of.
drop policy if exists "own conversations" on public.messages;
create policy "own conversations"
  on public.messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "send as self" on public.messages;
create policy "send as self"
  on public.messages for insert to authenticated with check (auth.uid() = sender_id);

drop policy if exists "recipient marks read" on public.messages;
create policy "recipient marks read"
  on public.messages for update to authenticated
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Conversation list for the signed-in member.
create or replace function public.my_threads()
returns table (other_id uuid, full_name text, last_body text, last_at timestamptz, unread bigint)
language sql security invoker stable as $$
  with pairs as (
    select case when sender_id = auth.uid() then recipient_id else sender_id end as other_id,
           body, created_at, read_at, recipient_id
    from public.messages
    where sender_id = auth.uid() or recipient_id = auth.uid()
  )
  select p.other_id,
         pr.full_name,
         (array_agg(p.body order by p.created_at desc))[1] as last_body,
         max(p.created_at) as last_at,
         count(*) filter (where p.recipient_id = auth.uid() and p.read_at is null) as unread
  from pairs p
  join public.profiles pr on pr.id = p.other_id
  group by p.other_id, pr.full_name
  order by last_at desc;
$$;

-- ------------------------------------------------------------
-- SECTION 7: notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  payload     jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "own notifications" on public.notifications;
create policy "own notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own notifications update" on public.notifications;
create policy "own notifications update"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reply to your post -> notification.
create or replace function public.notify_on_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare target uuid; who text;
begin
  if new.parent_id is null then return new; end if;
  select author_id into target from public.posts where id = new.parent_id;
  if target is null or target = new.author_id then return new; end if;
  select full_name into who from public.profiles where id = new.author_id;
  insert into public.notifications (user_id, type, payload)
  values (target, 'reply',
          jsonb_build_object('text', coalesce(who,'A member') || ' replied to your post in ' || new.pillar,
                             'post_id', new.parent_id, 'pillar', new.pillar));
  return new;
end $$;

drop trigger if exists on_post_reply on public.posts;
create trigger on_post_reply
  after insert on public.posts
  for each row execute function public.notify_on_reply();

-- New direct message -> notification.
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select full_name into who from public.profiles where id = new.sender_id;
  insert into public.notifications (user_id, type, payload)
  values (new.recipient_id, 'message',
          jsonb_build_object('text', coalesce(who,'A member') || ' sent you a message',
                             'sender_id', new.sender_id));
  return new;
end $$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.notify_on_message();

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- ------------------------------------------------------------
-- Make yourself a moderator after your first sign-in:
--   update public.profiles set is_moderator = true where id = '<your-uuid>';
-- ------------------------------------------------------------
