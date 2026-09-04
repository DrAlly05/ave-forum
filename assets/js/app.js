/* ============================================================
   AVE Forum — application
   Hash router, twelve sections, detail pages, search, and the
   account layer (profile, discussion, messages, notifications)
   running on Supabase.
   ============================================================ */
import { ORG, FOUNDER, NAV, PILLARS, VALUES, ABOUT, PAPERS,
         CASES, STORIES, INNOVATIONS, MEDIA, EVENTS,
         COUNTRIES, ROLES, INTERESTS } from "./content.js";
import * as api from "./api.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const initials = n => (n || "?").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
const when = t => new Date(t).toLocaleString(undefined,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const demoBadge = d => d ? `<span class="badge demo">DEMO</span>` : "";

let SESSION = null, PROFILE = null;

/* every seeded record, indexed for detail pages and search */
const LIBRARY = [
  ...CASES.map(x       => ({ ...x, type:"clinical",   typeName:"Clinical" })),
  ...STORIES.map(x     => ({ ...x, type:"stories",    typeName:"Frontline Stories" })),
  ...INNOVATIONS.map(x => ({ ...x, type:"innovation", typeName:"Innovation" })),
  ...MEDIA.map(x       => ({ ...x, type:"media",      typeName:"AVE Media", cat:x.kind })),
  ...EVENTS.map(x      => ({ ...x, type:"events",     typeName:"Events", cat:x.kind })),
  ...PAPERS.map(x      => ({ ...x, type:"research",   typeName:"Research", cat:x.topic,
                             teaser:`${x.authors} · ${x.journal}` }))
];
const byId = id => LIBRARY.find(x => x.id === id);

/* ============================================================
   Reusable pieces
   ============================================================ */
const tile = x => `
  <a class="tile" href="#/item/${x.id}">
    <div class="top"><span class="badge cat">${esc(x.cat || x.typeName)}</span>${demoBadge(x.demo)}</div>
    <h3>${esc(x.title)}</h3>
    <p>${esc(x.teaser || "")}</p>
    <div class="foot">${esc(x.typeName)}${x.when ? " · " + esc(x.when) : ""}</div>
  </a>`;

const rail = (kick, title, href, linkText) => `
  <div class="rail">
    <div><p class="kick">${esc(kick)}</p><h2>${esc(title)}</h2></div>
    ${href ? `<a href="${href}">${esc(linkText)} &rarr;</a>` : ""}
  </div>`;

const head = (kicker, title, lede, crumb) => `
  <div class="view-head"><div class="wrap">
    <p class="crumbs">${crumb || `<a href="#/">Home</a> / ${esc(title)}`}</p>
    <p class="kicker">${esc(kicker)}</p>
    <h1>${esc(title)}</h1>
    ${lede ? `<p>${esc(lede)}</p>` : ""}
  </div></div>`;

const joinCta = (title = "Add your voice", body = "Join clinicians, nurses, paramedics, researchers and educators from across the continent.") => `
  <section class="join"><div class="wrap">
    <h2>${esc(title)}</h2><p>${esc(body)}</p>
    <p style="margin-top:1.4rem"><a class="btn gold" href="#/register">Join AVE Forum</a>
      <a class="btn ghost" href="#/explore" style="margin-left:.5rem">Explore</a></p>
  </div></section>`;

/* ============================================================
   1. HOME
   ============================================================ */
const homeView = () => `
<div class="view" id="v-home">
  <div class="hero"><div class="wrap">
    <div class="hero-grid">
      <div>
        <p class="kicker" style="font-family:var(--ui);font-weight:600;font-size:.78rem;letter-spacing:.14em;color:var(--gold);margin:0 0 .8rem">A CONTINENTAL COMMUNITY OF PRACTICE</p>
        <h1>African Voice of Emergency Care</h1>
        <p class="lede">${esc(ORG.tagline)} A shared home for the clinicians, nurses, paramedics, researchers and innovators building emergency medicine across Africa.</p>
        <ul class="cycle">${ABOUT.cycle.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
        <div class="hero-cta">
          <a class="btn" href="#/register">Join AVE Forum</a>
          <a class="btn ghost" href="#/explore">Explore the platform</a>
        </div>
      </div>
      <img class="hero-logo" src="assets/img/ave-logo-inverse.png" width="460" height="458"
           alt="AVE Forum: African Voice of Emergency Care.">
    </div>
  </div>
  <div class="pulse-strip">
    <svg viewBox="0 0 1200 52" preserveAspectRatio="none" aria-hidden="true">
      <path class="ecg-path" d="M0 30 H180 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H420 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H700 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H980 l14 0 l10 -15 l12 32 l14 -42 l13 38 l11 -13 H1200"/>
    </svg>
  </div></div>

  <div class="stats"><div class="wrap stats-in">
    <div class="stat"><b>7</b><span>Interconnected pillars</span></div>
    <div class="stat"><b>${PAPERS.length}</b><span>Referenced African studies, linked to source</span></div>
    <div class="stat"><b>54</b><span>Countries the platform is open to</span></div>
    <div class="stat"><b>Free</b><span>To join, read and reuse in teaching</span></div>
  </div></div>

  <div class="notice"><div class="wrap notice-in">
    <span class="tag">PROTOTYPE</span>
    <p style="margin:0">Working platform presented at the ${esc(ORG.conference)}. Accounts, discussion, messaging and notifications are live. Content cards marked <span class="badge demo">DEMO</span> are seeded topic headings awaiting real contributions — they are not attributed to any person and report no findings. The Research Spotlight is real, referenced and linked to source.</p>
  </div></div>

  <section><div class="wrap">
    ${rail("Clinical Excellence","Cases and clinical teaching","#/clinical","Visit Clinical Excellence")}
    <div class="cards c3">${CASES.slice(0,3).map(x => tile({...x, typeName:"Clinical"})).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    ${rail("Research","African Research Spotlight","#/research","Visit Research")}
    <div class="cards c3">${PAPERS.slice(0,3).map(p => tile({...p, cat:p.topic, typeName:"Research", teaser:`${p.authors} · ${p.journal}`})).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    ${rail("AVE Media","Watch and listen","#/media","Visit AVE Media")}
    <div class="cards c3">${MEDIA.slice(0,3).map(x => tile({...x, cat:x.kind, typeName:"AVE Media"})).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    ${rail("Events","What is coming up","#/events","View all events")}
    <div class="cards c3">${EVENTS.map(x => tile({...x, cat:x.kind, typeName:"Events"})).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    ${rail("Frontline Stories","From the frontline","#/stories","Read more stories")}
    <div class="cards c4">${STORIES.map(x => tile({...x, typeName:"Frontline Stories"})).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    ${rail("Innovation","Continental innovation showcase","#/innovation","See all innovation")}
    <div class="cards c4">${INNOVATIONS.map(x => tile({...x, typeName:"Innovation"})).join("")}</div>
  </div></section>

  <hr class="rule">
  <section><div class="wrap">
    ${rail("Architecture","Seven interconnected pillars","#/explore","Explore everything")}
    <div class="pillars">
      ${PILLARS.map(p => `<a class="pillar" href="#/${p.id}"><h3><i>${p.n}</i>${esc(p.name)}</h3><p>${esc(p.blurb)}</p></a>`).join("")}
    </div>
  </div></section>

  ${founderPanel()}
  ${joinCta()}
</div>`;

/* ============================================================
   Founder panel
   ============================================================ */
const founderPanel = () => `
  <div class="founder"><div class="wrap" style="padding-block:clamp(2.6rem,6vw,4.2rem)">
    <div class="founder-in">
      <div>
        <p class="kicker" style="font-family:var(--ui);font-weight:600;font-size:.75rem;letter-spacing:.15em;color:var(--gold);margin:0 0 .8rem">FOUNDER'S VISION</p>
        <h2>${esc(FOUNDER.principle)}</h2>
        <div style="display:flex;gap:.9rem;align-items:center;margin-top:1.8rem">
          <div class="avatar lg">${esc(initials(FOUNDER.name))}</div>
          <div>
            <p class="who">${esc(FOUNDER.name)} <span class="badge founder">FOUNDER</span></p>
            <p class="cred">${esc(FOUNDER.role)}<br>${esc(FOUNDER.title)}<br>${esc(FOUNDER.institution)}</p>
          </div>
        </div>
      </div>
      <div>
        <blockquote>${esc(FOUNDER.message[0])}</blockquote>
        <p class="msg" style="margin-top:1.2rem">${esc(FOUNDER.message[3])}</p>
        <p class="sig">&ldquo;${esc(FOUNDER.signature)}&rdquo;</p>
        <p style="margin-top:1.4rem"><a class="btn ghost" href="#/about">Read the full message</a></p>
      </div>
    </div>
  </div></div>`;

/* ============================================================
   2. ABOUT
   ============================================================ */
const aboutView = () => `
<div class="view" id="v-about">
  ${head("About","About AVE Forum", `${ORG.full} — a pan-African digital ecosystem for emergency care education, research translation, innovation, leadership and professional collaboration.`)}
  <section><div class="wrap">
    <div class="split">
      <div>
        <h2 class="sec-title" style="font-size:1.25rem">Vision</h2>
        <p class="sec-intro">${esc(ABOUT.vision)}</p>
        <h2 class="sec-title" style="font-size:1.25rem;margin-top:2rem">Mission</h2>
        <p class="sec-intro">${esc(ABOUT.mission)}</p>
        <h2 class="sec-title" style="font-size:1.25rem;margin-top:2rem">Where this came from</h2>
        ${ABOUT.story.map(p => `<p class="sec-intro">${esc(p)}</p>`).join("")}
      </div>
      <div class="aside">
        <h3>THE ECOSYSTEM</h3>
        <ul>${ABOUT.cycle.map(c => `<li><strong>${esc(c)}</strong></li>`).join("")}</ul>
        <h3 style="margin-top:1.6rem">THE PILLARS</h3>
        <ul>${PILLARS.map(p => `<li><a href="#/${p.id}">${esc(p.n)} ${esc(p.name)}</a></li>`).join("")}</ul>
      </div>
    </div>

    <h2 class="sec-title" style="font-size:1.25rem;margin-top:2.8rem">Core values</h2>
    <div class="cards c3" style="margin-top:1.4rem">
      ${VALUES.map(([t,d]) => `<div class="tile"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}
    </div>
  </div></section>

  <div class="founder"><div class="wrap" style="padding-block:clamp(2.6rem,6vw,4rem)">
    <p class="kicker" style="font-family:var(--ui);font-weight:600;font-size:.75rem;letter-spacing:.15em;color:var(--gold);margin:0 0 .8rem">A MESSAGE FROM THE FOUNDER</p>
    <div class="founder-in">
      <div>
        <div style="display:flex;gap:.9rem;align-items:center">
          <div class="avatar lg">${esc(initials(FOUNDER.name))}</div>
          <div>
            <p class="who">${esc(FOUNDER.name)} <span class="badge founder">FOUNDER</span></p>
            <p class="cred">${esc(FOUNDER.role)}<br>${esc(FOUNDER.title)}<br>${esc(FOUNDER.institution)}</p>
          </div>
        </div>
        <p class="sig" style="font-size:.95rem">${esc(FOUNDER.principle)}</p>
      </div>
      <div>
        ${FOUNDER.message.map(p => `<p class="msg">${esc(p)}</p>`).join("")}
        <h3 style="font-family:var(--ui);color:var(--gold);font-size:.78rem;letter-spacing:.13em;margin:1.8rem 0 .6rem">THE LEGACY WE ARE BUILDING</h3>
        <blockquote>${esc(FOUNDER.legacy)}</blockquote>
        <p class="sig">&ldquo;${esc(FOUNDER.signature)}&rdquo;</p>
      </div>
    </div>
  </div></div>

  <section><div class="wrap">
    <h2 class="sec-title" style="font-size:1.25rem">How the platform was built</h2>
    <p class="sec-intro">AVE Forum runs on an open, auditable architecture: a static front end that loads on a phone over a mobile connection, and a managed Postgres backend with row-level security governing every read and write. The source is public.</p>
    <p class="sec-intro">Platform designed and built by <a href="${ORG.builder.url}">${esc(ORG.builder.name)}</a>.</p>
  </div></section>
</div>`;

/* ============================================================
   3. EXPLORE — everything, searchable and filterable
   ============================================================ */
const exploreView = () => `
<div class="view" id="v-explore">
  ${head("Explore","Explore AVE Forum","Everything on the platform in one place. Search across cases, research, media, events, stories and innovation.")}
  <section><div class="wrap">
    <div class="search-row">
      <input id="exploreSearch" type="search" placeholder="Search the platform…" aria-label="Search">
    </div>
    <div class="chips" id="exploreChips">
      <button aria-pressed="true" data-f="all">All</button>
      <button aria-pressed="false" data-f="clinical">Clinical</button>
      <button aria-pressed="false" data-f="research">Research</button>
      <button aria-pressed="false" data-f="media">Media</button>
      <button aria-pressed="false" data-f="events">Events</button>
      <button aria-pressed="false" data-f="stories">Stories</button>
      <button aria-pressed="false" data-f="innovation">Innovation</button>
    </div>
    <p class="form-note" id="exploreCount" style="margin-top:1rem"></p>
    <div class="cards c3" id="exploreResults" style="margin-top:.6rem"></div>
  </div></section>
</div>`;

function wireExplore() {
  const box = $("#exploreResults"); if (!box) return;
  let filter = "all", q = "";
  const draw = () => {
    const term = q.trim().toLowerCase();
    const rows = LIBRARY.filter(x =>
      (filter === "all" || x.type === filter) &&
      (!term || `${x.title} ${x.teaser || ""} ${x.cat || ""}`.toLowerCase().includes(term)));
    box.innerHTML = rows.length ? rows.map(tile).join("")
      : `<p class="empty">Nothing matches that yet. Try a broader term, or <a href="#/register">join</a> and contribute the first one.</p>`;
    $("#exploreCount").textContent = `${rows.length} item${rows.length === 1 ? "" : "s"}`;
  };
  $("#exploreSearch").addEventListener("input", e => { q = e.target.value; draw(); });
  $$("#exploreChips button").forEach(b => b.addEventListener("click", () => {
    filter = b.dataset.f;
    $$("#exploreChips button").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    draw();
  }));
  draw();
}

/* ============================================================
   4-10. PILLAR SECTIONS
   ============================================================ */
const sectionFeed = {
  clinical:   () => CASES.map(x => tile({...x, typeName:"Clinical"})),
  stories:    () => STORIES.map(x => tile({...x, typeName:"Frontline Stories"})),
  innovation: () => INNOVATIONS.map(x => tile({...x, typeName:"Innovation"})),
  research:   () => PAPERS.map(p => tile({...p, cat:p.topic, typeName:"Research", teaser:`${p.authors} · ${p.journal}`}))
};

const pillarView = p => `
<div class="view" id="v-${p.id}">
  ${head(`Pillar ${p.n}`, p.name, p.lede)}
  <section><div class="wrap">
    <div class="split">
      <div>
        ${sectionFeed[p.id] ? `
          ${rail("Content", p.id === "research" ? "African Research Spotlight" : "In this pillar", null)}
          <div class="cards">${sectionFeed[p.id]().join("")}</div>` : ""}

        <h2 class="sec-title" style="font-size:1.25rem;margin-top:2.6rem">What this pillar covers</h2>
        <div style="margin-top:1.3rem">
          ${p.items.map(([t,d]) => `<div class="paper"><h3>${esc(t)}</h3><p class="jrnl">${esc(d)}</p></div>`).join("")}
        </div>
      </div>
      <div class="aside">
        <h3>DISCUSSION</h3>
        <p style="font-size:.9rem;color:var(--ink-2);margin:0 0 .9rem">Members can post questions, cases and answers in the ${esc(p.name)} room.</p>
        <a class="btn dark sm" href="#/discussion?pillar=${p.id}">Open the room</a>
        <h3 style="margin-top:1.6rem">CONTRIBUTE</h3>
        <p style="font-size:.9rem;color:var(--ink-2);margin:0 0 .9rem">Teaching material, a de-identified case, a paper or an episode.</p>
        <a class="btn sm" href="#/register">Contribute</a>
        <h3 style="margin-top:1.6rem">OTHER PILLARS</h3>
        <ul>${PILLARS.filter(o => o.id !== p.id).map(o => `<li><a href="#/${o.id}">${esc(o.name)}</a></li>`).join("")}</ul>
      </div>
    </div>
  </div></section>
  ${joinCta()}
</div>`;

/* ============================================================
   11. MEDIA
   ============================================================ */
const mediaView = () => `
<div class="view" id="v-media">
  ${head("AVE Media","AVE Media","Podcast, video, interviews and live sessions. Conversations with the people building emergency care across Africa.")}
  <section><div class="wrap">
    ${rail("Podcast","Episodes",null)}
    <div class="cards c3">${MEDIA.map(x => tile({...x, cat:x.kind, typeName:"AVE Media"})).join("")}</div>

    <h2 class="sec-title" style="font-size:1.25rem;margin-top:2.6rem">Live broadcast</h2>
    <div class="slot" style="margin-top:1.1rem">
      <h3>No broadcast scheduled</h3>
      <p>Grand rounds, journal club and conference sessions stream here. Members are told first.</p>
    </div>

    <h2 class="sec-title" style="font-size:1.25rem;margin-top:2.6rem">Subscribe</h2>
    <p class="sec-intro">The podcast feed lives at <code>/feed.xml</code> and is submitted to Spotify and Apple Podcasts as episodes publish.</p>
    <p style="margin-top:1.2rem"><a class="btn dark" href="#/register">Be a guest</a></p>
  </div></section>
</div>`;

/* ============================================================
   12. EVENTS
   ============================================================ */
const eventsView = () => `
<div class="view" id="v-events">
  ${head("Events","Events","Webinars, journal clubs and the continental conference calendar, in one place.")}
  <section><div class="wrap">
    <div class="cards c3">${EVENTS.map(x => tile({...x, cat:x.kind, typeName:"Events"})).join("")}</div>
    <div class="slot" style="margin-top:1.6rem">
      <h3>Submit an event</h3>
      <p>Running a course, webinar or conference relevant to African emergency care? Send it through the registration form and it goes on the calendar.</p>
    </div>
  </div></section>
</div>`;

/* ============================================================
   COMMUNITY — real member directory from the database
   ============================================================ */
const communityView = () => `
<div class="view" id="v-community">
  ${head("Community","Community","Members, country representatives and mentorship. Everyone who works in African emergency care belongs here.")}
  <section><div class="wrap">
    <div class="split">
      <div>
        ${rail("Directory","Members",null)}
        <div id="directory"><p class="empty">Loading members…</p></div>
      </div>
      <div class="aside">
        <h3>DISCUSSION ROOMS</h3>
        <ul>${PILLARS.map(p => `<li><a href="#/discussion?pillar=${p.id}">${esc(p.name)}</a></li>`).join("")}</ul>
        <h3 style="margin-top:1.6rem">MENTORSHIP</h3>
        <p style="font-size:.9rem;color:var(--ink-2);margin:0 0 .9rem">Ask to be paired with an established professional, or offer to mentor.</p>
        <a class="btn sm" href="#/register">Request or offer mentorship</a>
        <h3 style="margin-top:1.6rem">COUNTRY REPRESENTATIVES</h3>
        <p style="font-size:.9rem;color:var(--ink-2);margin:0">Representatives are drawn from the membership. Say so when you register.</p>
      </div>
    </div>
  </div></section>
</div>`;

async function renderDirectory() {
  const el = $("#directory"); if (!el) return;
  if (!api.isLive()) { el.innerHTML = `<p class="empty">The member directory opens when the database is connected.</p>`; return; }
  if (!SESSION) {
    el.innerHTML = `<div class="gate"><h3>Members only</h3>
      <p>The directory is visible to signed-in members, so people's details are not exposed publicly.</p>
      <p style="margin-top:1rem"><a class="btn dark" href="#/profile">Sign in</a>
      <a class="btn" href="#/register" style="margin-left:.5rem">Join</a></p></div>`;
    return;
  }
  const rows = await api.directory();
  el.innerHTML = rows.length
    ? `<div class="people">${rows.map(p => `
        <a class="person" href="#/discussion">
          <div class="avatar">${esc(initials(p.full_name))}</div>
          <div><b>${esc(p.full_name || "Member")}${p.is_country_rep ? ` <span class="badge nav">REP</span>` : ""}</b>
            <span>${esc([p.role, p.institution].filter(Boolean).join(" · ") || "Member")}</span>
            <span>${esc(p.country || "")}</span></div>
        </a>`).join("")}</div>`
    : `<p class="empty">No members yet. You could be the first.</p>`;
}

/* ============================================================
   ITEM DETAIL
   ============================================================ */
const itemView = () => `<div class="view" id="v-item"><div id="itemBody"></div></div>`;

function renderItem(id) {
  const el = $("#itemBody"); if (!el) return;
  const x = byId(id);
  if (!x) { el.innerHTML = head("Not found","We could not find that","The item may have been moved."); return; }

  const isPaper = x.type === "research";
  el.innerHTML = `
    ${head(x.typeName, x.title, "", `<a href="#/">Home</a> / <a href="#/${x.type}">${esc(x.typeName)}</a> / ${esc(x.cat || "")}`)}
    <section><div class="wrap">
      <div class="split">
        <div class="detail">
          <div class="top" style="display:flex;gap:.45rem;margin-bottom:1rem">
            <span class="badge cat">${esc(x.cat || x.typeName)}</span>${demoBadge(x.demo)}
          </div>
          ${isPaper ? `
            <p class="lead">${esc(x.authors)}</p>
            <p class="jrnl">${esc(x.journal)}</p>
            ${x.doi ? `<p style="margin-top:1rem"><a class="btn dark" href="https://doi.org/${esc(x.doi)}" target="_blank" rel="noopener">Read the paper</a></p>` : ""}
            <h2>Why it is here</h2>
            <p>This is peer-reviewed work on African emergency care, linked to source so any claim on this platform can be checked against the original. The Research Spotlight exists because this literature is scattered and rarely reaches the clinicians it describes.</p>
          ` : `
            <p class="lead">${esc(x.teaser || "")}</p>
            ${x.when ? `<p class="jrnl"><strong>${esc(x.when)}</strong>${x.where ? " · " + esc(x.where) : ""}</p>` : ""}
            ${x.status ? `<p class="jrnl">Status: ${esc(x.status)}</p>` : ""}
            ${x.url ? `<p style="margin-top:1rem"><a class="btn dark" href="${esc(x.url)}" target="_blank" rel="noopener">More information</a></p>` : ""}
            ${x.demo ? `
              <div class="warn" style="background:rgba(210,162,78,.1);border-color:rgba(210,162,78,.5);color:var(--gold-deep)">
                <strong>This is a seeded topic heading, not published work.</strong> It names a subject the platform will cover. No author, institution, finding or outcome is attached to it, and none should be inferred. It is replaced the moment a member contributes real content on this topic.
              </div>` : ""}
            <h2>Contribute to this</h2>
            <p>If you have taught, written or lived this, the platform wants your version of it. Contributions are credited to you, reviewed before publication, and must be de-identified where they concern patients.</p>
            <p style="margin-top:1.2rem"><a class="btn" href="#/register">Contribute</a></p>
          `}
        </div>
        <div class="aside">
          <h3>MORE IN ${esc(x.typeName.toUpperCase())}</h3>
          <ul>${LIBRARY.filter(o => o.type === x.type && o.id !== x.id).slice(0,6)
                 .map(o => `<li><a href="#/item/${o.id}">${esc(o.title)}</a></li>`).join("")}</ul>
          <h3 style="margin-top:1.6rem">DISCUSS</h3>
          <p style="font-size:.9rem;color:var(--ink-2);margin:0 0 .9rem">Take this to the discussion rooms.</p>
          <a class="btn dark sm" href="#/discussion">Open discussion</a>
        </div>
      </div>
    </div></section>`;
}

/* ============================================================
   ACCOUNT: profile, discussion, messages, notifications
   ============================================================ */
const previewBanner = () => `
  <div class="notice-in" style="background:rgba(210,162,78,.12);border:1px solid rgba(210,162,78,.45);padding:.9rem 1rem;margin-bottom:1.6rem">
    <span class="tag">PREVIEW</span>
    <p style="margin:0">This section is fully built — accounts, database, row-level security and real-time updates. It switches on when a Supabase project is connected in <code>assets/js/api.js</code>.</p>
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
    const msg = $("#signInMsg"), btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      await api.signInWithEmail(form.email.value);
      msg.className = "msg good"; msg.setAttribute("data-on",""); msg.textContent = "Check your inbox for the sign-in link.";
    } catch (err) {
      msg.className = "msg err"; msg.setAttribute("data-on",""); msg.textContent = "Could not send the link: " + err.message;
    }
    btn.disabled = false; btn.textContent = "Send sign-in link";
  });
}

const profileView = () => `
<div class="view" id="v-profile">
  ${head("Your account","Your profile","Your discipline, country and institution. This is what other members see, and how country representatives are identified.")}
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
        <h2 class="sec-title" style="font-size:1.35rem">${esc(p.full_name || "Complete your profile")}</h2>
        <p class="sec-intro" style="margin-top:.25rem">${esc([p.role,p.institution,p.country].filter(Boolean).join(" · ") || SESSION?.email || "Not signed in")}</p>
      </div>
      ${preview ? "" : `<button class="btn dark sm" id="signOutBtn" style="margin-left:auto">Sign out</button>`}
    </div>
    <form class="form" id="profileForm" style="max-width:660px">
      <div class="two">
        <div><label for="p-name">Full name</label><input id="p-name" name="full_name" required value="${esc(p.full_name||"")}"></div>
        <div><label for="p-inst">Institution</label><input id="p-inst" name="institution" value="${esc(p.institution||"")}"></div>
      </div>
      <div class="two">
        <div><label for="p-country">Country of practice</label><select id="p-country" name="country" required>
          <option value="">Select…</option>${COUNTRIES.map(c=>`<option ${p.country===c?"selected":""}>${c}</option>`).join("")}</select></div>
        <div><label for="p-role">Role</label><select id="p-role" name="role" required>
          <option value="">Select…</option>${ROLES.map(r=>`<option ${p.role===r?"selected":""}>${r}</option>`).join("")}</select></div>
      </div>
      <div><label for="p-bio">Short bio</label><textarea id="p-bio" name="bio" rows="3" placeholder="What you work on, and what you would like to contribute.">${esc(p.bio||"")}</textarea></div>
      <div><button class="btn" type="submit" ${preview?"disabled":""}>Save profile</button></div>
      <div class="msg" id="profileMsg"></div>
    </form>`;

  if (preview) { $$("#profileForm input,#profileForm select,#profileForm textarea").forEach(i => i.disabled = true); return; }

  $("#signOutBtn").addEventListener("click", async () => { await api.signOut(); location.hash = "#/"; location.reload(); });
  $("#profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target)), msg = $("#profileMsg");
    try {
      await api.saveProfile(SESSION.id, f);
      PROFILE = { ...PROFILE, ...f }; updateAccountNav();
      msg.className = "msg good"; msg.setAttribute("data-on",""); msg.textContent = "Profile saved.";
    } catch (err) {
      msg.className = "msg err"; msg.setAttribute("data-on",""); msg.textContent = "Could not save: " + err.message;
    }
  });
}

const discussionView = () => `
<div class="view" id="v-discussion">
  ${head("Community","Discussion and messages","One open room per pillar, plus private messages between members. Moderated, searchable, and archived so answers are not lost.")}
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
        ${PILLARS.map(p => `<li><button role="tab" data-room="${p.id}" aria-selected="${p.id===active}">${esc(p.name)}</button></li>`).join("")}
      </ul>
      <div class="thread">
        <div class="thread-body" id="threadBody"><p class="empty">Loading…</p></div>
        <form class="thread-form" id="postForm">
          <textarea name="body" rows="1" placeholder="Write to the ${esc(PILLARS.find(p=>p.id===active).name)} room…" ${preview?"disabled":"required"}></textarea>
          <button class="btn" type="submit" ${preview?"disabled":""}>Post</button>
        </form>
      </div>
    </div>`;

  $$("[data-room]").forEach(b => b.addEventListener("click", () => { location.hash = `#/discussion?pillar=${b.dataset.room}`; }));

  if (preview) {
    $("#threadBody").innerHTML = `<p class="empty">This room opens when the database is connected.</p>`;
    return;
  }
  await loadRoom(active);
  $("#postForm").addEventListener("submit", async e => {
    e.preventDefault();
    const ta = e.target.querySelector("textarea"), body = ta.value.trim();
    if (!body) return;
    ta.value = "";
    try { await api.createPost(active, body); await loadRoom(active); }
    catch (err) { alert("Could not post: " + err.message); }
  });
}

async function loadRoom(pillar) {
  const box = $("#threadBody"); if (!box) return;
  const posts = await api.listPosts(pillar);
  box.innerHTML = posts.length ? posts.map(bubble).join("")
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
      <span class="when">${esc([p.profiles?.role,p.profiles?.country].filter(Boolean).join(", "))} · ${when(p.created_at)}</span>
      <p>${esc(p.body)}</p>
    </div>
  </div>`;

const notificationsView = () => `
<div class="view" id="v-notifications">
  ${head("Your account","Notifications","Replies to your posts, direct messages, and platform announcements.")}
  <section><div class="wrap" id="notifBody"></div></section>
</div>`;

async function renderNotifBody() {
  const el = $("#notifBody"); if (!el) return;
  if (!api.isLive()) {
    el.innerHTML = previewBanner() + `<p class="empty">Notifications are generated by database triggers once the platform is connected.</p>`;
    return;
  }
  if (!SESSION) { el.innerHTML = signInGate(); wireSignIn(); return; }
  const rows = await api.listNotifications();
  el.innerHTML = rows.length
    ? `<p style="margin:0 0 1.2rem"><button class="btn dark sm" id="markRead">Mark all as read</button></p>` +
      rows.map(n => `<div class="notif" ${n.read_at?"":"data-unread"}>
        <div class="avatar" style="width:34px;height:34px;font-size:.8rem">${esc((n.type||"n")[0].toUpperCase())}</div>
        <div><p>${esc(n.payload?.text || n.type)}</p><time>${when(n.created_at)}</time></div></div>`).join("")
    : `<p class="empty">Nothing yet. Notifications appear when someone replies to you or messages you.</p>`;
  $("#markRead")?.addEventListener("click", async () => { await api.markAllRead(); await refreshBadge(); renderNotifBody(); });
  await refreshBadge();
}

async function refreshBadge() {
  const badge = $("#notifDot"); if (!badge) return;
  if (!api.isLive() || !SESSION) { badge.removeAttribute("data-on"); return; }
  const n = await api.unreadCount();
  if (n > 0) { badge.textContent = n > 9 ? "9+" : n; badge.setAttribute("data-on",""); }
  else badge.removeAttribute("data-on");
}

/* ============================================================
   REGISTER
   ============================================================ */
const registerView = () => `
<div class="view" id="v-register">
  ${head("Join","Join AVE Forum","Registration is open to everyone working in emergency care in Africa — physicians, residents, nurses, paramedics, researchers, educators and students.")}
  <section class="join on-navy"><div class="wrap">
    <h2>Become a founding member</h2>
    <p>Tell us who you are and where you work. You will hear from us as sections open, and country representatives are drawn from this list.</p>
    <form class="form" id="registerForm">
      <div class="two">
        <div><label for="r-name">Full name</label><input id="r-name" name="full_name" required autocomplete="name"></div>
        <div><label for="r-email">Email</label><input id="r-email" name="email" type="email" required autocomplete="email"></div>
      </div>
      <div class="two">
        <div><label for="r-country">Country of practice</label><select id="r-country" name="country" required>
          <option value="">Select…</option>${COUNTRIES.map(c=>`<option>${c}</option>`).join("")}</select></div>
        <div><label for="r-role">Role</label><select id="r-role" name="role" required>
          <option value="">Select…</option>${ROLES.map(r=>`<option>${r}</option>`).join("")}</select></div>
      </div>
      <div><label for="r-interest">What brings you here</label><select id="r-interest" name="interest" required>
        <option value="">Select…</option>${INTERESTS.map(i=>`<option>${i}</option>`).join("")}</select></div>
      <div><label for="r-msg">Anything you want us to know (optional)</label>
        <textarea id="r-msg" name="message" rows="3" placeholder="A case you'd like discussed, a paper worth spotlighting, a colleague we should feature…"></textarea></div>
      <label class="check"><input type="checkbox" name="consent" required>
        <span>I agree to be contacted about AVE Forum, and I understand no patient-identifiable information may be posted on the platform.</span></label>
      <div><button class="btn gold" type="submit">Register my interest</button></div>
      <p class="form-note">Your details are used only to contact you about AVE Forum. Not shared, not sold, unsubscribe at any time.</p>
      <div class="msg" id="registerMsg"></div>
    </form>
  </div></section>
</div>`;

function wireRegister() {
  const form = $("#registerForm"); if (!form || form.dataset.wired) return;
  form.dataset.wired = "1";
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]"), msg = $("#registerMsg");
    const data = Object.fromEntries(new FormData(form)); delete data.consent;
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      await api.register(data);
      form.querySelectorAll("input,select,textarea").forEach(i => i.type === "checkbox" ? i.checked = false : i.value = "");
      msg.className = "msg good"; msg.setAttribute("data-on","");
      msg.textContent = "You're on the list. We'll write to you as sections open, and sooner if you offered to contribute.";
    } catch (err) {
      msg.className = "msg err"; msg.setAttribute("data-on","");
      msg.textContent = "Could not register: " + err.message + ". Email " + ORG.email + " and we will add you.";
    }
    btn.disabled = false; btn.textContent = "Register my interest";
  });
}

/* ============================================================
   BUILD + ROUTE
   ============================================================ */
function build() {
  $("#views").innerHTML =
    homeView() + aboutView() + exploreView() +
    PILLARS.map(pillarView).join("") +
    mediaView() + eventsView() + communityView() +
    profileView() + discussionView() + notificationsView() + registerView() + itemView();

  $("#panelList").innerHTML = [["", "Home", "The platform at a glance"], ...NAV.map(([id, name]) => {
    const p = PILLARS.find(x => x.id === id);
    return [id, name, p ? p.blurb : ({about:"Vision, mission, values and the founder's message",
      explore:"Search everything on the platform", media:"Podcast, video and live sessions",
      events:"Webinars, journal clubs and conferences"}[id] || "")];
  }), ["register","Join AVE Forum","Become a founding member"]]
    .map(([h,t,d]) => `<li><a href="#/${h}" data-close>${esc(t)}<small>${esc(d)}</small></a></li>`).join("");

  $("#footPillars").innerHTML = PILLARS.map(p => `<li><a href="#/${p.id}">${esc(p.name)}</a></li>`).join("");
}

function route() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query || "");

  let id = parts[0] ? "v-" + parts[0] : "v-home";
  if (parts[0] === "item") id = "v-item";

  const target = document.getElementById(id) || $("#v-home");
  $$(".view").forEach(v => v.removeAttribute("data-active"));
  target.setAttribute("data-active","");
  $$(".bar nav a.nl").forEach(a => a.toggleAttribute("aria-current", a.getAttribute("href") === "#/" + (parts[0] || "")));
  closePanel();
  window.scrollTo(0,0);

  if (id === "v-item")          renderItem(parts[1]);
  if (id === "v-explore")       wireExplore();
  if (id === "v-community")     renderDirectory();
  if (id === "v-profile")       renderProfileBody();
  if (id === "v-discussion")    renderDiscussionBody(params.get("pillar"));
  if (id === "v-notifications") renderNotifBody();
  if (id === "v-register")      wireRegister();
}

const panel = () => $("#panel");
function openPanel(){ panel().setAttribute("open",""); $("#menuBtn").setAttribute("aria-expanded","true"); document.body.style.overflow="hidden"; }
function closePanel(){ panel().removeAttribute("open"); $("#menuBtn")?.setAttribute("aria-expanded","false"); document.body.style.overflow=""; }

function updateAccountNav() {
  const el = $("#accountNav"); if (!el) return;
  el.innerHTML = SESSION
    ? `<a class="nl" href="#/profile" title="Your profile">${esc(initials(PROFILE?.full_name || SESSION.email))}</a>`
    : `<a class="btn sm" href="#/register">Join</a>`;
}

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
      SESSION = u; PROFILE = u ? await api.getProfile(u.id) : null;
      updateAccountNav(); route();
    });
    await api.subscribeNotifications(refreshBadge);
  }
  updateAccountNav();
  route();
  await refreshBadge();
}

boot();
