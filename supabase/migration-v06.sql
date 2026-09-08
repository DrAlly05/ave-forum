-- ============================================================
-- AVE Forum — migration v0.6
-- Adds: file, image and video attachments in the community feed,
-- group discussions, comments and direct messages.
--
-- Two deliberate tiers of upload:
--   media  — published platform content. Contributors only.
--   chat   — attachments inside conversations. Any member.
--
-- Run ONCE in the SQL editor, after migration-v05.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Attachment bucket for conversations
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat', 'chat', true, 26214400,
        array['image/jpeg','image/png','image/webp','image/gif','image/heic',
              'video/mp4','video/webm','video/quicktime',
              'audio/mpeg','audio/mp4','audio/wav','audio/ogg',
              'application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = 26214400,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat read" on storage.objects;
create policy "chat read"
  on storage.objects for select
  using (bucket_id = 'chat');

-- Any signed-in member may attach, but only inside their own folder.
drop policy if exists "members attach" on storage.objects;
create policy "members attach"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "members remove own attachments" on storage.objects;
create policy "members remove own attachments"
  on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------------------
-- 2. Attachment columns
-- ------------------------------------------------------------
alter table public.posts    add column if not exists attachment_path text;
alter table public.posts    add column if not exists attachment_mime text;
alter table public.posts    add column if not exists attachment_name text;

alter table public.comments add column if not exists attachment_path text;
alter table public.comments add column if not exists attachment_mime text;
alter table public.comments add column if not exists attachment_name text;

alter table public.messages add column if not exists attachment_path text;
alter table public.messages add column if not exists attachment_mime text;
alter table public.messages add column if not exists attachment_name text;

-- A post or message may now carry a file with no text of its own.
alter table public.posts    drop constraint if exists posts_body_check;
alter table public.posts    add constraint posts_body_check
  check (char_length(body) <= 4000 and (char_length(body) > 0 or attachment_path is not null));

alter table public.comments drop constraint if exists comments_body_check;
alter table public.comments add constraint comments_body_check
  check (char_length(body) <= 4000 and (char_length(body) > 0 or attachment_path is not null));

alter table public.messages drop constraint if exists messages_body_check;
alter table public.messages add constraint messages_body_check
  check (char_length(body) <= 4000 and (char_length(body) > 0 or attachment_path is not null));

-- ------------------------------------------------------------
-- 3. Reporting, so members can flag an attachment
-- ------------------------------------------------------------
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  target_type  text not null check (target_type in ('post','comment','message','media')),
  target_id    text not null,
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  reason       text not null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "members report" on public.reports;
create policy "members report" on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "moderators read reports" on public.reports;
create policy "moderators read reports" on public.reports for select to authenticated
  using (auth.uid() = reporter_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));

drop policy if exists "moderators resolve reports" on public.reports;
create policy "moderators resolve reports" on public.reports for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator));
