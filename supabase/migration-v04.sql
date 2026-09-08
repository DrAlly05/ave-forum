-- ============================================================
-- AVE Forum — migration v0.4
-- Adds: media uploads (Supabase Storage), comments, likes,
-- and the six official pillars.
--
-- Run this ONCE in the Supabase SQL editor, after schema.sql.
-- Safe to re-run: every statement is guarded.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Pillars: allow the six official ids, keep the old ones so
--    existing posts are not orphaned.
-- ------------------------------------------------------------
alter table public.posts drop constraint if exists posts_pillar_check;
alter table public.posts add constraint posts_pillar_check check (pillar in (
  'knowledge','research','mentorship','community','innovation','hervoice',
  'clinical','leadership','frontline'          -- retired, kept for history
));

-- ------------------------------------------------------------
-- 2. Contributor role — who may upload to AVE Media
-- ------------------------------------------------------------
alter table public.profiles add column if not exists is_contributor boolean not null default false;

-- ------------------------------------------------------------
-- 3. Storage bucket for media
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 104857600,
        array['audio/mpeg','audio/mp4','audio/wav','audio/ogg',
              'video/mp4','video/webm','video/quicktime',
              'image/jpeg','image/png','image/webp',
              'application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = 104857600,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read published media. Only contributors may write,
-- and only inside a folder named after their own user id.
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "contributors upload media" on storage.objects;
create policy "contributors upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and (p.is_contributor or p.is_moderator))
  );

drop policy if exists "owners manage own media" on storage.objects;
create policy "owners manage own media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------------------
-- 4. Media records
-- ------------------------------------------------------------
create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  uploader_id   uuid not null references public.profiles(id) on delete cascade,
  kind          text not null check (kind in ('podcast','video','interview','document','image')),
  title         text not null check (char_length(title) between 3 and 200),
  description   text,
  storage_path  text not null,
  mime          text,
  bytes         bigint,
  pillar        text,
  published     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists media_published_idx on public.media (published, created_at desc);

alter table public.media enable row level security;

drop policy if exists "published media readable" on public.media;
create policy "published media readable"
  on public.media for select
  using (published = true or auth.uid() = uploader_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

drop policy if exists "contributors insert media" on public.media;
create policy "contributors insert media"
  on public.media for insert to authenticated
  with check (auth.uid() = uploader_id
              and exists (select 1 from public.profiles p
                          where p.id = auth.uid() and (p.is_contributor or p.is_moderator)));

drop policy if exists "uploader updates media" on public.media;
create policy "uploader updates media"
  on public.media for update to authenticated
  using (auth.uid() = uploader_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

drop policy if exists "uploader deletes media" on public.media;
create policy "uploader deletes media"
  on public.media for delete to authenticated
  using (auth.uid() = uploader_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

-- ------------------------------------------------------------
-- 5. Comments — attach to any target (post, media, library item)
-- ------------------------------------------------------------
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  target_type  text not null check (target_type in ('post','media','item')),
  target_id    text not null,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 4000),
  is_removed   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists comments_target_idx on public.comments (target_type, target_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "members read comments" on public.comments;
create policy "members read comments"
  on public.comments for select to authenticated using (is_removed = false);

drop policy if exists "members write comments" on public.comments;
create policy "members write comments"
  on public.comments for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "authors edit comments" on public.comments;
create policy "authors edit comments"
  on public.comments for update to authenticated
  using (auth.uid() = author_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

-- Comment on a post -> notify the post author
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare target uuid; who text;
begin
  if new.target_type <> 'post' then return new; end if;
  select author_id into target from public.posts where id::text = new.target_id;
  if target is null or target = new.author_id then return new; end if;
  select full_name into who from public.profiles where id = new.author_id;
  insert into public.notifications (user_id, type, payload)
  values (target, 'comment',
          jsonb_build_object('text', coalesce(who,'A member') || ' commented on your post',
                             'target_id', new.target_id));
  return new;
end $$;

drop trigger if exists on_new_comment on public.comments;
create trigger on_new_comment
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- ------------------------------------------------------------
-- 6. Likes
-- ------------------------------------------------------------
create table if not exists public.likes (
  target_type text not null check (target_type in ('post','media','comment')),
  target_id   text not null,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (target_type, target_id, user_id)
);

alter table public.likes enable row level security;

drop policy if exists "members read likes" on public.likes;
create policy "members read likes" on public.likes for select to authenticated using (true);

drop policy if exists "members like" on public.likes;
create policy "members like" on public.likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "members unlike" on public.likes;
create policy "members unlike" on public.likes for delete to authenticated using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 7. Realtime
-- ------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.media;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 8. Make yourself a contributor so you can upload:
--   update public.profiles set is_contributor = true where id = '<your-uuid>';
-- ------------------------------------------------------------
