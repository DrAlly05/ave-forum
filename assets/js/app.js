/* ============================================================
   AVE Forum — application shell.
   Hash router + view rendering for the eight sections.
   ============================================================ */
import { ORG, ABOUT, PILLARS, MEDIA, PAPERS, COUNTRIES, ROLES } from "./content.js";
import * as api from "./api.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const initials = n => (n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const when = t => { const d = new Date(t); return d.toLocaleString(undefined, { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }); };

let SESSION = null;   // supabase user
let PROFILE = null;   // profiles row

/* ============================================================
   SECTION 1 — Home
   ============================================================ */
const homeView = () => `
<div class="view" id="v-home">
  <div class="hero">
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <h1>The African voice of emergency care.</h1>
          <p class="lede">One place for the clinicians, nurses, paramedics, researchers and educators who keep emergency care running across Africa — to learn from each other, publish to each other, and be heard.</p>
          <div class="hero-cta">
            <a class="btn" href="#/media">Podcast and media</a>
            <a class="btn ghost" href="#/register">Join the forum</a>
          </div>
        </div>
        <img class="hero-logo" src="assets/img/ave-logo-inverse.png" width="460" height="458"
             alt="AVE Forum: African Voice of Emergency Care. Educate, connect, innovate, save lives.">
      </div>
    </div>
    <div class="pulse-strip">
      <svg viewBox="0 0 1200 52" preserveAspectRatio="none" aria-hidden="true">
        <path class="ecg-path" d="M0 30 H180 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H420 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H700 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H980 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H1200"/>
      </svg>
    </div>
  </div>

  <div class="notice"><div class="wrap notice-in">
    <span class="tag">PROTOTYPE</span>
    <p style="margin:0">Working prototype of AVE Forum, presented at the ${ORG.conference}. Sections marked <em>in development</em> are not open yet. No membership or engagement figures are shown that have not actually been recorded.</p>
  </div></div>

  <section>
    <div class="wrap">
      <h2 class="sec-title">Emergency care in Africa is growing faster than the places to talk about it.</h2>
      <p class="sec-intro">${ABOUT.story[0]}</p>
      <p class="sec-intro">AVE Forum is built to close that gap — African-led, contextually grounded, and free to the people doing the work.</p>
      <p style="margin-top:1.6rem"><a class="btn dark" href="#/about">About AVE Forum</a></p>
    </div>
  </section>

  <hr class="rule">

  <section>
    <div class="wrap">
      <h2 class="sec-title">Seven interconnected pillars</h2>
      <p class="sec-intro">Each pillar is a working area of the platform with its own content and its own discussion.</p>
      <div class="pillars">
        ${PILLARS.map((p, i) => `
          <a class="pillar" href="#/pillar/${p.id}">
            <h3><i>${String(i + 1).padStart(2, "0")}</i>${esc(p.name)}</h3>
            <p>${esc(p.blurb)}</p>
          </a>`).join("")}
      </div>
    </div>
  </section>

  <hr class="rule">

  <section>
    <div class="wrap">
      <h2 class="sec-title">The platform</h2>
      <div class="grid three">
        ${[
          ["#/about","About","Vision, mission, values and where this came from.","ok","OPEN"],
          ["#/media","Podcast and media","Recorded conversations, video and live broadcast.","live","OPEN"],
          ["#/research","Research Spotlight","African emergency care research, linked to source.","live","OPEN"],
          ["#/profile","Your profile","Your discipline, country and institution.","soon","ACCOUNT"],
          ["#/discussion","Discussion and messages","Pillar discussion and direct messages between members.","soon","ACCOUNT"],
          ["#/notifications","Notifications","Replies, mentions and platform announcements.","soon","ACCOUNT"]
        ].map(([h, t, d, k, l]) => `
          <a class="cell" href="${h}"><h3>${t}</h3><p>${d}</p><span class="pill ${k}">${l}</span></a>`).join("")}
      </div>
    </div>
  </section>

  ${registerSection()}
</div>`;

/* ============================================================
   SECTION 2 — About
   ============================================================ */
const aboutView = () => `
<div class="view" id="v-about">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 2</p>
    <h1>About AVE Forum</h1>
    <p>${esc(ORG.full)} — a pan-African digital platform for emergency care education, research translation, innovation, leadership and professional collaboration.</p>
  </div></div>

  <section><div class="wrap">
    <div style="max-width:var(--measure)">
      <h2 class="sec-title" style="font-size:1.3rem">Vision</h2>
      <p class="sec-intro">${esc(ABOUT.vision)}</p>
      <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.2rem">Mission</h2>
      <p class="sec-intro">${esc(ABOUT.mission)}</p>
    </div>

    <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.8rem">Core values</h2>
    <div class="grid three">
      ${ABOUT.values.map(([t, d]) => `<div class="cell"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}
    </div>

    <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.8rem">The seven pillars</h2>
    <div class="pillars">
      ${PILLARS.map((p, i) => `
        <a class="pillar" href="#/pillar/${p.id}">
          <h3><i>${String(i + 1).padStart(2, "0")}</i>${esc(p.name)}</h3>
          <p>${esc(p.blurb)}</p>
        </a>`).join("")}
    </div>

    <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.8rem">Where this came from</h2>
    <div class="narrow">${ABOUT.story.slice(1).map(p => `<p class="sec-intro">${esc(p)}</p>`).join("")}</div>
  </div></section>
</div>`;

/* ============================================================
   SECTION 3 — Pillar pages
   ============================================================ */
const pillarView = (p, i) => `
<div class="view" id="v-pillar-${p.id}">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/about">← All pillars</a>
    <p class="kicker">Pillar ${String(i + 1).padStart(2, "0")}</p>
    <h1>${esc(p.name)}</h1>
    <p>${esc(p.lede)}</p>
  </div></div>

  <section><div class="wrap">
    <span class="pill soon">CONTENT IN DEVELOPMENT</span>
    <h2 class="sec-title" style="margin-top:.85rem;font-size:1.35rem">What this pillar covers</h2>
    <div style="margin-top:1.6rem;max-width:var(--measure)">
      ${p.items.map(([t, d]) => `<div class="paper"><h3>${esc(t)}</h3><p class="jrnl">${esc(d)}</p></div>`).join("")}
    </div>
    ${p.id === "research" ? researchBlock() : ""}
    ${p.id === "hervoice" ? herVoiceBlock() : ""}
    <div class="grid" style="margin-top:2.4rem">
      <a class="cell" href="#/discussion?pillar=${p.id}"><h3>Discuss this pillar</h3>
        <p>Members can post questions, cases and answers in the ${esc(p.name)} room.</p><span class="pill soon">ACCOUNT REQUIRED</span></a>
      <a class="cell" href="#/register"><h3>Contribute content</h3>
        <p>Teaching material, a case, a paper or an episode — tell us what you can bring.</p><span class="pill live">OPEN</span></a>
    </div>
  </div></section>
</div>`;

const researchBlock = () => `
  <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.6rem">African Research Spotlight</h2>
  <p class="sec-intro">Peer-reviewed work on emergency care systems, training, mentorship and digital health in Africa. Every entry links to source.</p>
  <div style="margin-top:1.6rem">
    ${PAPERS.map(([t, a, j, doi]) => `
      <div class="paper">
        <h3>${esc(t)}</h3>
        <p class="auth">${esc(a)}</p>
        <p class="jrnl">${esc(j)}</p>
        ${doi ? `<p style="margin:.3rem 0 0"><a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi.org/${doi}</a></p>` : ""}
      </div>`).join("")}
  </div>
  <div class="slot"><h3>Submit a paper</h3><p>Published African emergency care research we have missed? Send it through the registration form and it goes into the spotlight.</p></div>`;

const herVoiceBlock = () => `
  <h2 class="sec-title" style="font-size:1.3rem;margin-top:2.6rem">First five features — nominations open</h2>
  <p class="sec-intro">These are not filled with names we have not spoken to. Nominate a woman whose work belongs on this page and we will approach her.</p>
  <div class="grid" style="margin-top:1.5rem">
    ${[1,2,3,4,5].map(n => `<div class="cell slot"><h3>Feature ${n} — nomination open</h3>
      <p>Reserved for a woman working in African emergency care, featured with her consent.</p></div>`).join("")}
  </div>
  <p style="margin-top:1.5rem"><a class="btn dark" href="#/register">Nominate a colleague</a></p>`;

/* ============================================================
   SECTION 4 — Podcast and media
   ============================================================ */
const mediaView = () => `
<div class="view" id="v-media">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 4</p>
    <h1>Podcast and media</h1>
    <p>${esc(MEDIA.lede)}</p>
  </div></div>

  <section><div class="wrap">
    <h2 class="sec-title" style="font-size:1.35rem">Episodes</h2>
    <p class="sec-intro">Episodes run 25 to 40 minutes, are free, and will be published on Spotify, Apple Podcasts and here. The feed is at <code>/feed.xml</code>.</p>
    <div style="margin-top:1.6rem">
      ${MEDIA.episodes.map(e => `
        <div class="card">
          <p class="meta">${e.status === "published" ? "Episode " + e.n : "Episode " + e.n + " — planned, not yet recorded"}</p>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.desc)}</p>
          ${e.audio ? `<audio controls preload="none" src="${esc(e.audio)}" style="width:100%;margin-top:.9rem"></audio>` : ""}
          ${e.video ? `<div class="embed" style="margin-top:.9rem"><iframe src="${esc(e.video)}" title="${esc(e.title)}" allowfullscreen loading="lazy"></iframe></div>` : ""}
        </div>`).join("")}
    </div>

    <h2 class="sec-title" style="font-size:1.35rem;margin-top:2.8rem">Live broadcast</h2>
    ${MEDIA.liveEmbed
      ? `<div class="embed" style="margin-top:1.2rem"><iframe src="${esc(MEDIA.liveEmbed)}" title="AVE Forum live" allowfullscreen loading="lazy"></iframe></div>`
      : `<div class="slot" style="margin-top:1.2rem"><h3>No broadcast scheduled</h3><p>${esc(MEDIA.liveNote)}</p></div>`}

    <div class="slot" style="margin-top:1.6rem">
      <h3>Be a guest</h3>
      <p>Nominate yourself or the person we should be interviewing through the <a href="#/register">registration form</a>.</p>
    </div>
  </div></section>
</div>`;

/* ============================================================
   SECTION 5 — User profile
   ============================================================ */
const profileView = () => `
<div class="view" id="v-profile">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 5</p>
    <h1>Your profile</h1>
    <p>Your discipline, country and institution. This is what other members see, and how country representatives are identified.</p>
  </div></div>
  <section><div class="wrap" id="profileBody"></div></section>
</div>`;

function renderProfileBody() {
  const el = $("#profileBody"); if (!el) return;

  const preview = !api.isLive();
  if (!preview && !SESSION) { el.innerHTML = signInGate(); wireSignIn(); return; }

  const p = PROFILE || {};
  el.innerHTML = `
    ${preview ? previewBanner() : ""}
    <div class="profile-head">
      <div class="avatar lg">${esc(initials(p.full_name || SESSION?.email || "AVE"))}</div>
      <div>
        <h2 class="sec-title" style="font-size:1.4rem">${esc(p.full_name || "Complete your profile")}</h2>
        <p class="sec-intro" style="margin-top:.25rem">${esc([p.role, p.institution, p.country].filter(Boolean).join(", ") || SESSION?.email || "Not signed in")}</p>
      </div>
      ${preview ? "" : `<button class="btn dark sm" id="signOutBtn" style="margin-left:auto">Sign out</button>`}
    </div>

    <form class="form" id="profileForm" style="max-width:640px">
      <div class="two">
        <div><label for="p-name">Full name</label><input id="p-name" name="full_name" required value="${esc(p.full_name || "")}"></div>
        <div><label for="p-inst">Institution</label><input id="p-inst" name="institution" value="${esc(p.institution || "")}"></div>
      </div>
      <div class="two">
        <div><label for="p-country">Country of practice</label><select id="p-country" name="country" required>
          <option value="">Select…</option>${COUNTRIES.map(c => `<option ${p.country === c ? "selected" : ""}>${c}</option>`).join("")}
        </select></div>
        <div><label for="p-role">Role</label><select id="p-role" name="role" required>
          <option value="">Select…</option>${ROLES.map(r => `<option ${p.role === r ? "selected" : ""}>${r}</option>`).join("")}
        </select></div>
      </div>
      <div><label for="p-bio">Short bio</label><textarea id="p-bio" name="bio" rows="3" placeholder="What you work on, and what you would like to contribute.">${esc(p.bio || "")}</textarea></div>
      <div><button class="btn" type="submit" ${preview ? "disabled" : ""}>Save profile</button></div>
      <div class="msg" id="profileMsg"></div>
    </form>`;

  if (preview) { $$("#profileForm input,#profileForm select,#profileForm textarea").forEach(i => i.disabled = true); return; }

  $("#signOutBtn").addEventListener("click", async () => { await api.signOut(); location.hash = "#/"; location.reload(); });
  $("#profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const msg = $("#profileMsg");
    try {
      await api.saveProfile(SESSION.id, f);
      PROFILE = { ...PROFILE, ...f };
      msg.className = "msg good"; msg.textContent = "Profile saved."; msg.setAttribute("data-on", "");
    } catch (err) {
      msg.className = "msg err"; msg.textContent = "Could not save: " + err.message; msg.setAttribute("data-on", "");
    }
  });
}

/* ============================================================
   SECTION 6 — Discussion and direct messages
   ============================================================ */
const discussionView = () => `
<div class="view" id="v-discussion">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 6</p>
    <h1>Discussion and messages</h1>
    <p>One open room per pillar, plus private messages between members. Moderated, searchable, and archived so answers are not lost.</p>
  </div></div>
  <section><div class="wrap" id="discussionBody"></div></section>
</div>`;

let unsubscribePosts = () => {};

async function renderDiscussionBody(pillarId) {
  const el = $("#discussionBody"); if (!el) return;

  const preview = !api.isLive();
  if (!preview && !SESSION) { el.innerHTML = signInGate(); wireSignIn(); return; }

  const active = pillarId || PILLARS[0].id;
  el.innerHTML = `
    ${preview ? previewBanner() : ""}
    <div class="warn"><strong>No patient-identifiable information.</strong> Remove names, hospital numbers, dates of birth, photographs and any detail that could identify a patient before you post. Posts that identify a patient are removed.</div>
    <div class="chat-shell">
      <ul class="room-list" role="tablist">
        ${PILLARS.map(p => `<li><button role="tab" data-room="${p.id}" aria-selected="${p.id === active}">${esc(p.name)}</button></li>`).join("")}
      </ul>
      <div class="thread">
        <div class="thread-body" id="threadBody"><p class="empty">Loading…</p></div>
        <form class="thread-form" id="postForm">
          <textarea name="body" rows="1" placeholder="Write to the ${esc(PILLARS.find(p => p.id === active).name)} room…" ${preview ? "disabled" : "required"}></textarea>
          <button class="btn" type="submit" ${preview ? "disabled" : ""}>Post</button>
        </form>
      </div>
    </div>`;

  $$("[data-room]").forEach(b => b.addEventListener("click", () => { location.hash = `#/discussion?pillar=${b.dataset.room}`; }));

  if (preview) {
    $("#threadBody").innerHTML = `<p class="empty">This room opens when the database is connected. Posts appear here in real time, newest last, with the author's name, role and country.</p>`;
    return;
  }

  await loadRoom(active);

  $("#postForm").addEventListener("submit", async e => {
    e.preventDefault();
    const ta = e.target.querySelector("textarea");
    const body = ta.value.trim(); if (!body) return;
    ta.value = "";
    try { await api.createPost(active, body); } catch (err) { alert("Could not post: " + err.message); }
  });
}

async function loadRoom(pillar) {
  const box = $("#threadBody"); if (!box) return;
  const posts = await api.listPosts(pillar);
  box.innerHTML = posts.length
    ? posts.map(bubble).join("")
    : `<p class="empty">No posts yet in this room. Start the conversation.</p>`;
  box.scrollTop = box.scrollHeight;

  unsubscribePosts();
  unsubscribePosts = await api.subscribePosts(pillar, async () => {
    const fresh = await api.listPosts(pillar);
    box.innerHTML = fresh.map(bubble).join("");
    box.scrollTop = box.scrollHeight;
  });
}

const bubble = p => `
  <div class="bubble">
    <div class="avatar">${esc(initials(p.profiles?.full_name))}</div>
    <div>
      <span class="who">${esc(p.profiles?.full_name || "Member")}</span>
      <span class="when">${esc([p.profiles?.role, p.profiles?.country].filter(Boolean).join(", "))} · ${when(p.created_at)}</span>
      <p>${esc(p.body)}</p>
    </div>
  </div>`;

/* ============================================================
   SECTION 7 — Notifications
   ============================================================ */
const notificationsView = () => `
<div class="view" id="v-notifications">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 7</p>
    <h1>Notifications</h1>
    <p>Replies to your posts, direct messages, and platform announcements.</p>
  </div></div>
  <section><div class="wrap" id="notifBody"></div></section>
</div>`;

async function renderNotifBody() {
  const el = $("#notifBody"); if (!el) return;
  if (!api.isLive()) {
    el.innerHTML = previewBanner() +
      `<div class="notif"><div class="avatar" style="width:34px;height:34px;font-size:.8rem">R</div>
        <div><p>Replies to your posts appear here.</p><time>Example of the notification format</time></div></div>
       <div class="notif"><div class="avatar" style="width:34px;height:34px;font-size:.8rem">M</div>
        <div><p>Direct messages from other members appear here.</p><time>Example of the notification format</time></div></div>
       <p class="empty">Nothing real yet — notifications are generated by database triggers once the platform is connected.</p>`;
    return;
  }
  if (!SESSION) { el.innerHTML = signInGate(); wireSignIn(); return; }

  const rows = await api.listNotifications();
  el.innerHTML = rows.length
    ? `<p style="margin:0 0 1.2rem"><button class="btn dark sm" id="markRead">Mark all as read</button></p>` +
      rows.map(n => `
        <div class="notif" ${n.read_at ? "" : "data-unread"}>
          <div class="avatar" style="width:34px;height:34px;font-size:.8rem">${esc((n.type || "n")[0].toUpperCase())}</div>
          <div><p>${esc(n.payload?.text || n.type)}</p><time>${when(n.created_at)}</time></div>
        </div>`).join("")
    : `<p class="empty">Nothing yet. Notifications appear when someone replies to you or messages you.</p>`;

  $("#markRead")?.addEventListener("click", async () => { await api.markAllRead(); await refreshBadge(); renderNotifBody(); });
  await refreshBadge();
}

async function refreshBadge() {
  const badge = $("#notifDot"); if (!badge) return;
  if (!api.isLive() || !SESSION) { badge.removeAttribute("data-on"); return; }
  const n = await api.unreadCount();
  if (n > 0) { badge.textContent = n > 9 ? "9+" : n; badge.setAttribute("data-on", ""); }
  else badge.removeAttribute("data-on");
}

/* ============================================================
   SECTION 8 — Join / register
   ============================================================ */
function registerSection() {
  return `
  <section class="join on-navy" id="register">
    <div class="wrap">
      <h2>Join the founding community</h2>
      <p>Tell us who you are and where you work. You will hear from us when the sections you care about open, and country representatives will be drawn from this list.</p>
      <form class="form" id="registerForm">
        <div class="two">
          <div><label for="r-name">Full name</label><input id="r-name" name="full_name" required autocomplete="name"></div>
          <div><label for="r-email">Email</label><input id="r-email" name="email" type="email" required autocomplete="email"></div>
        </div>
        <div class="two">
          <div><label for="r-country">Country of practice</label><select id="r-country" name="country" required>
            <option value="">Select…</option>${COUNTRIES.map(c => `<option>${c}</option>`).join("")}</select></div>
          <div><label for="r-role">Role</label><select id="r-role" name="role" required>
            <option value="">Select…</option>${ROLES.map(r => `<option>${r}</option>`).join("")}</select></div>
        </div>
        <div><label for="r-interest">What brings you here</label><select id="r-interest" name="interest" required>
          <option value="">Select…</option>
          <option>Listening and learning</option>
          <option>Contributing a podcast episode or case</option>
          <option>Research collaboration or mentorship</option>
          <option>Her Voice in EM — nominating or being featured</option>
          <option>Representing my country</option>
          <option>Partnership or funding</option>
        </select></div>
        <div><label for="r-msg">Anything you want us to know (optional)</label>
          <textarea id="r-msg" name="message" rows="3" placeholder="A case you'd like discussed, a paper worth spotlighting, a colleague we should feature…"></textarea></div>
        <label class="check"><input type="checkbox" name="consent" required>
          <span>I agree to be contacted about AVE Forum, and I understand no patient-identifiable information may be posted on the platform.</span></label>
        <div><button class="btn gold" type="submit">Register my interest</button></div>
        <p class="form-note">Your details are used only to contact you about AVE Forum. Not shared, not sold, unsubscribe at any time.</p>
        <div class="msg" id="registerMsg"></div>
      </form>
    </div>
  </section>`;
}

const registerView = () => `
<div class="view" id="v-register">
  <div class="view-head"><div class="wrap">
    <a class="back" href="#/">← Home</a>
    <p class="kicker">Section 8</p>
    <h1>Join AVE Forum</h1>
    <p>Registration is open to everyone working in emergency care in Africa — physicians, residents, nurses, paramedics, researchers, educators and students.</p>
  </div></div>
  ${registerSection()}
</div>`;

function wireRegister() {
  $$("#registerForm").forEach(form => {
    if (form.dataset.wired) return;
    form.dataset.wired = "1";
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const msg = form.querySelector("#registerMsg") || form.querySelector(".msg");
      const data = Object.fromEntries(new FormData(form));
      delete data.consent;
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await api.register(data);
        form.querySelectorAll("input,select,textarea").forEach(i => { i.type === "checkbox" ? i.checked = false : i.value = ""; });
        msg.className = "msg good"; msg.setAttribute("data-on", "");
        msg.textContent = "You're on the list. We'll write to you as sections open, and sooner if you offered to contribute.";
      } catch (err) {
        msg.className = "msg err"; msg.setAttribute("data-on", "");
        msg.textContent = "Could not register: " + err.message + ". Email " + ORG.email + " and we will add you.";
      }
      btn.disabled = false; btn.textContent = "Register my interest";
    });
  });
}

/* ============================================================
   Shared gates
   ============================================================ */
const previewBanner = () => `
  <div class="notice-in" style="background:rgba(210,162,78,.12);border:1px solid rgba(210,162,78,.45);padding:.9rem 1rem;margin-bottom:1.6rem">
    <span class="tag">PREVIEW</span>
    <p style="margin:0">This section is fully built — accounts, database, row-level security and real-time updates. It switches on the moment a Supabase project is connected in <code>assets/js/api.js</code>. The interface below is live; the data is not yet.</p>
  </div>`;

const signInGate = () => `
  <div class="gate">
    <h3>Sign in</h3>
    <p>Enter your email and we will send a sign-in link. No password to remember.</p>
    <form class="form" id="signInForm" style="margin-top:1.1rem">
      <div><label for="s-email">Email</label><input id="s-email" name="email" type="email" required autocomplete="email"></div>
      <div><button class="btn" type="submit">Send sign-in link</button></div>
      <div class="msg" id="signInMsg"></div>
    </form>
  </div>`;

function wireSignIn() {
  const form = $("#signInForm"); if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = $("#signInMsg");
    const btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      await api.signInWithEmail(form.email.value);
      msg.className = "msg good"; msg.setAttribute("data-on", "");
      msg.textContent = "Check your inbox for the sign-in link.";
    } catch (err) {
      msg.className = "msg err"; msg.setAttribute("data-on", "");
      msg.textContent = "Could not send the link: " + err.message;
    }
    btn.disabled = false; btn.textContent = "Send sign-in link";
  });
}

/* ============================================================
   Build the DOM
   ============================================================ */
function build() {
  $("#views").innerHTML =
    homeView() + aboutView() +
    PILLARS.map((p, i) => pillarView(p, i)).join("") +
    mediaView() + profileView() + discussionView() + notificationsView() + registerView();

  $("#panelList").innerHTML = [
    ["#/", "Home", "The platform at a glance"],
    ["#/about", "About AVE Forum", "Vision, mission, pillars and core values"],
    ...PILLARS.map(p => [`#/pillar/${p.id}`, p.name, p.blurb]),
    ["#/media", "Podcast and media", "Episodes, video and live broadcast"],
    ["#/profile", "Your profile", "Discipline, country, institution"],
    ["#/discussion", "Discussion and messages", "Pillar rooms and direct messages"],
    ["#/notifications", "Notifications", "Replies, messages and announcements"],
    ["#/register", "Join / register", "Become a founding member"]
  ].map(([h, t, d]) => `<li><a href="${h}" data-close>${esc(t)}<small>${esc(d)}</small></a></li>`).join("");

  $("#footPillars").innerHTML = PILLARS.map(p => `<li><a href="#/pillar/${p.id}">${esc(p.name)}</a></li>`).join("");
}

/* ============================================================
   Router
   ============================================================ */
function route() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query || "");

  let id = "v-home";
  if (parts[0] === "pillar" && parts[1]) id = "v-pillar-" + parts[1];
  else if (parts[0]) id = "v-" + parts[0];

  const target = document.getElementById(id) || $("#v-home");
  $$(".view").forEach(v => v.removeAttribute("data-active"));
  target.setAttribute("data-active", "");

  $$(".bar nav a.nl").forEach(a => {
    a.toggleAttribute("aria-current", a.getAttribute("href") === "#/" + (parts[0] || ""));
  });

  closePanel();
  window.scrollTo(0, 0);

  if (id === "v-profile")       renderProfileBody();
  if (id === "v-discussion")    renderDiscussionBody(params.get("pillar"));
  if (id === "v-notifications") renderNotifBody();
  wireRegister();
}

/* ============================================================
   Menu panel
   ============================================================ */
const panel = () => $("#panel");
function openPanel()  { panel().setAttribute("open", ""); $("#menuBtn").setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; }
function closePanel() { panel().removeAttribute("open"); $("#menuBtn")?.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }

/* ============================================================
   Boot
   ============================================================ */
async function boot() {
  build();

  $("#menuBtn").addEventListener("click", () => panel().hasAttribute("open") ? closePanel() : openPanel());
  $("#panelClose").addEventListener("click", closePanel);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closePanel(); });
  panel().addEventListener("click", e => { if (e.target.closest("[data-close]")) closePanel(); });
  window.addEventListener("hashchange", route);

  if (api.isLive()) {
    SESSION = await api.currentUser();
    if (SESSION) PROFILE = await api.getProfile(SESSION.id);
    await api.onAuthChange(async u => {
      SESSION = u;
      PROFILE = u ? await api.getProfile(u.id) : null;
      updateAccountNav();
      route();
    });
    await api.subscribeNotifications(refreshBadge);
  }

  updateAccountNav();
  route();
  await refreshBadge();
}

function updateAccountNav() {
  const el = $("#accountNav");
  if (!el) return;
  el.innerHTML = SESSION
    ? `<a class="nl" href="#/profile">${esc(initials(PROFILE?.full_name || SESSION.email))}</a>`
    : `<a class="btn sm" href="#/register">Join</a>`;
}

boot();
