/* ============================================================
   AVE Forum — backend module (Supabase).

   To switch the platform on:
     1. Create a free project at https://supabase.com
     2. Run supabase/schema.sql in the SQL editor
     3. Paste the project URL and anon key below
     4. Commit and deploy

   Until then the site runs in PREVIEW MODE: every section renders,
   and the account areas say plainly that sign-in is not connected.
   The anon key is designed to be public — row-level security in
   schema.sql is what protects the data. Never put the service_role
   key in this file.
   ============================================================ */

export const CONFIG = {
  SUPABASE_URL: "https://polrviohgygoyhmwprki.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbHJ2aW9oZ3lnb3lobXdwcmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDg2NDYsImV4cCI6MjEwMzkyNDY0Nn0.RweVzw4DfXkB2Tz5IzIQ70kmZCMmNAwbSX8iziM2gjI"
};

export const isLive = () => Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

let client = null;

export async function db() {
  if (!isLive()) return null;
  if (client) return client;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return client;
}

/* ---------------- auth ---------------- */

export async function currentUser() {
  const c = await db(); if (!c) return null;
  const { data } = await c.auth.getUser();
  return data?.user ?? null;
}

export async function signInWithEmail(email) {
  const c = await db(); if (!c) throw new Error("preview");
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw error;
}

export async function signOut() {
  const c = await db(); if (!c) return;
  await c.auth.signOut();
}

export async function onAuthChange(fn) {
  const c = await db(); if (!c) return;
  c.auth.onAuthStateChange((_e, session) => fn(session?.user ?? null));
}

/* ---------------- profiles ---------------- */

export async function getProfile(id) {
  const c = await db(); if (!c) return null;
  const { data } = await c.from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function saveProfile(id, fields) {
  const c = await db(); if (!c) throw new Error("preview");
  const { error } = await c.from("profiles").upsert({ id, ...fields, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function directory({ country, role } = {}) {
  const c = await db(); if (!c) return [];
  let q = c.from("profiles").select("id,full_name,country,role,institution,is_country_rep").order("full_name");
  if (country) q = q.eq("country", country);
  if (role) q = q.eq("role", role);
  const { data } = await q.limit(200);
  return data ?? [];
}

/* ---------------- discussion (public, per pillar) ---------------- */

export async function listPosts(pillar) {
  const c = await db(); if (!c) return [];
  const { data } = await c
    .from("posts")
    .select("id,pillar,body,created_at,author_id,profiles(full_name,country,role)")
    .eq("pillar", pillar)
    .order("created_at", { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function createPost(pillar, body) {
  const c = await db(); if (!c) throw new Error("preview");
  const user = await currentUser();
  const { error } = await c.from("posts").insert({ pillar, body, author_id: user.id });
  if (error) throw error;
}

export async function subscribePosts(pillar, fn) {
  const c = await db(); if (!c) return () => {};
  const ch = c.channel("posts:" + pillar)
    .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: `pillar=eq.${pillar}` },
        p => fn(p.new))
    .subscribe();
  return () => c.removeChannel(ch);
}

/* ---------------- direct messages ---------------- */

export async function listThreads() {
  const c = await db(); if (!c) return [];
  const { data } = await c.rpc("my_threads");
  return data ?? [];
}

export async function listMessages(otherId) {
  const c = await db(); if (!c) return [];
  const me = (await currentUser()).id;
  const { data } = await c
    .from("messages")
    .select("id,sender_id,recipient_id,body,created_at")
    .or(`and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`)
    .order("created_at", { ascending: true })
    .limit(300);
  return data ?? [];
}

export async function sendMessage(recipientId, body) {
  const c = await db(); if (!c) throw new Error("preview");
  const me = (await currentUser()).id;
  const { error } = await c.from("messages").insert({ sender_id: me, recipient_id: recipientId, body });
  if (error) throw error;
}

/* ---------------- notifications ---------------- */

export async function listNotifications() {
  const c = await db(); if (!c) return [];
  const { data } = await c.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  return data ?? [];
}

export async function unreadCount() {
  const c = await db(); if (!c) return 0;
  const { count } = await c.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
  return count ?? 0;
}

export async function markAllRead() {
  const c = await db(); if (!c) return;
  await c.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
}

export async function subscribeNotifications(fn) {
  const c = await db(); if (!c) return () => {};
  const user = await currentUser(); if (!user) return () => {};
  const ch = c.channel("notif:" + user.id)
    .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        p => fn(p.new))
    .subscribe();
  return () => c.removeChannel(ch);
}

/* ---------------- public registration (Section 8) ---------------- */

export async function register(entry) {
  const c = await db();
  if (!c) {
    // Preview mode: fall back to Netlify Forms so nothing is lost before the
    // database exists. Requires the hidden static form in index.html.
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "register", ...entry }).toString()
    });
    return;
  }
  const { error } = await c.from("registrations").insert(entry);
  if (error) throw error;
}

/* ============================================================
   v0.4 — media uploads, comments, likes, direct-message inbox
   ============================================================ */

/* ---------------- media (Supabase Storage) ---------------- */

export async function listMedia() {
  const c = await db(); if (!c) return [];
  const { data } = await c
    .from("media")
    .select("id,kind,title,description,storage_path,mime,bytes,published,created_at,profiles(full_name,country,role)")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export function mediaUrl(path) {
  if (!CONFIG.SUPABASE_URL || !path) return "";
  return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

/** Upload a File and create its media row. onProgress is optional. */
export async function uploadMedia(file, { kind, title, description, pillar, published = false }) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${user.id}/${Date.now()}-${safe}`;

  const { error: upErr } = await c.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (upErr) throw upErr;

  const { error: rowErr } = await c.from("media").insert({
    uploader_id: user.id, kind, title, description, pillar,
    storage_path: path, mime: file.type, bytes: file.size, published
  });
  if (rowErr) {
    await c.storage.from("media").remove([path]);   // don't leave orphaned files
    throw rowErr;
  }
  return path;
}

export async function canUpload() {
  const c = await db(); if (!c) return false;
  const user = await currentUser(); if (!user) return false;
  const { data } = await c.from("profiles").select("is_contributor,is_moderator").eq("id", user.id).maybeSingle();
  return Boolean(data?.is_contributor || data?.is_moderator);
}

/* ---------------- comments ---------------- */

export async function listComments(targetType, targetId) {
  const c = await db(); if (!c) return [];
  const { data } = await c
    .from("comments")
    .select("id,body,created_at,author_id,profiles(full_name,country,role)")
    .eq("target_type", targetType).eq("target_id", String(targetId))
    .order("created_at", { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function addComment(targetType, targetId, body) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");
  const { error } = await c.from("comments")
    .insert({ target_type: targetType, target_id: String(targetId), author_id: user.id, body });
  if (error) throw error;
}

export async function subscribeComments(targetType, targetId, fn) {
  const c = await db(); if (!c) return () => {};
  const ch = c.channel(`comments:${targetType}:${targetId}`)
    .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `target_id=eq.${targetId}` },
        p => fn(p.new))
    .subscribe();
  return () => c.removeChannel(ch);
}

/* ---------------- likes ---------------- */

export async function likeCount(targetType, targetId) {
  const c = await db(); if (!c) return { count: 0, mine: false };
  const user = await currentUser();
  const { count } = await c.from("likes").select("user_id", { count: "exact", head: true })
    .eq("target_type", targetType).eq("target_id", String(targetId));
  let mine = false;
  if (user) {
    const { data } = await c.from("likes").select("user_id")
      .eq("target_type", targetType).eq("target_id", String(targetId)).eq("user_id", user.id).maybeSingle();
    mine = Boolean(data);
  }
  return { count: count ?? 0, mine };
}

export async function toggleLike(targetType, targetId) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");
  const { mine } = await likeCount(targetType, targetId);
  if (mine) {
    await c.from("likes").delete()
      .eq("target_type", targetType).eq("target_id", String(targetId)).eq("user_id", user.id);
    return false;
  }
  await c.from("likes").insert({ target_type: targetType, target_id: String(targetId), user_id: user.id });
  return true;
}

/* ---------------- direct-message inbox ---------------- */

export async function markThreadRead(otherId) {
  const c = await db(); if (!c) return;
  const me = (await currentUser())?.id; if (!me) return;
  await c.from("messages").update({ read_at: new Date().toISOString() })
    .eq("sender_id", otherId).eq("recipient_id", me).is("read_at", null);
}

export async function subscribeMessages(fn) {
  const c = await db(); if (!c) return () => {};
  const user = await currentUser(); if (!user) return () => {};
  const ch = c.channel("dm:" + user.id)
    .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        p => fn(p.new))
    .subscribe();
  return () => c.removeChannel(ch);
}

/* ---------------- community feed ---------------- */

export async function recentPosts(limit = 30) {
  const c = await db(); if (!c) return [];
  const { data } = await c
    .from("posts")
    .select("id,pillar,body,created_at,author_id,profiles(full_name,country,role)")
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/* ============================================================
   v0.5 — groups, memberships, filtered directory, member pages
   ============================================================ */

export const SPECIALTIES = [
  "Emergency Medicine","Trauma and Resuscitation","Paediatric Emergency Medicine",
  "Emergency Care Systems Research","Disaster and Mass Casualty Medicine",
  "Toxicology and Critical Care","Emergency Nursing and Triage","Pre-hospital Care",
  "Emergency Care Policy","Ultrasound and POCUS","Medical Education","General Medicine"
];

/* ---------------- groups ---------------- */

export async function listGroups() {
  const c = await db(); if (!c) return [];
  const { data } = await c.from("group_counts").select("*").order("name");
  return data ?? [];
}

export async function myGroupIds() {
  const c = await db(); if (!c) return [];
  const user = await currentUser(); if (!user) return [];
  const { data } = await c.from("group_members").select("group_id").eq("user_id", user.id);
  return (data ?? []).map(r => r.group_id);
}

export async function joinGroup(groupId) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");
  const { error } = await c.from("group_members").insert({ group_id: groupId, user_id: user.id });
  if (error && error.code !== "23505") throw error;   // 23505 = already a member
}

export async function leaveGroup(groupId) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");
  const { error } = await c.from("group_members").delete()
    .eq("group_id", groupId).eq("user_id", user.id);
  if (error) throw error;
}

export async function groupPosts(groupId, limit = 50) {
  const c = await db(); if (!c) return [];
  const { data } = await c.from("posts")
    .select("id,title,body,created_at,group_id,author_id,profiles(full_name,country,role,is_verified,is_founder)")
    .eq("group_id", groupId).eq("is_removed", false)
    .order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export async function createGroupPost(groupId, title, body) {
  const c = await db(); if (!c) throw new Error("Database not connected");
  const user = await currentUser(); if (!user) throw new Error("Sign in first");
  const { error } = await c.from("posts")
    .insert({ group_id: groupId, title, body, author_id: user.id });
  if (error) throw error;
}

/** Newest discussion across all groups, for the Community landing tab. */
export async function recentGroupPosts(limit = 8) {
  const c = await db(); if (!c) return [];
  const { data } = await c.from("posts")
    .select("id,title,body,created_at,group_id,profiles(full_name),groups(name)")
    .not("group_id", "is", null).eq("is_removed", false)
    .order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

/* ---------------- filtered directory ---------------- */

export async function searchDirectory({ country, role, specialty, q } = {}) {
  const c = await db(); if (!c) return [];
  let query = c.from("profiles")
    .select("id,full_name,country,role,specialty,institution,bio,is_country_rep,is_verified,is_mentor,is_editor,is_moderator,is_contributor,is_founder")
    .order("is_founder", { ascending: false })
    .order("full_name");
  if (country)   query = query.eq("country", country);
  if (role)      query = query.eq("role", role);
  if (specialty) query = query.eq("specialty", specialty);
  if (q)         query = query.ilike("full_name", `%${q}%`);
  const { data } = await query.limit(300);
  return data ?? [];
}

/** Distinct values actually present in the directory, for the filter dropdowns. */
export async function directoryFacets() {
  const c = await db(); if (!c) return { countries: [], roles: [], specialties: [] };
  const { data } = await c.from("profiles").select("country,role,specialty").limit(1000);
  const uniq = k => [...new Set((data ?? []).map(r => r[k]).filter(Boolean))].sort();
  return { countries: uniq("country"), roles: uniq("role"), specialties: uniq("specialty") };
}

export async function memberCount() {
  const c = await db(); if (!c) return 0;
  const { count } = await c.from("profiles").select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function countryCount() {
  const c = await db(); if (!c) return 0;
  const { data } = await c.from("profiles").select("country").limit(1000);
  return new Set((data ?? []).map(r => r.country).filter(Boolean)).size;
}
