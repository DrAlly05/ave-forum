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
