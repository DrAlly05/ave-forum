# AVE Forum — African Voice of Emergency Care

A pan-African digital platform for emergency care education, research translation,
innovation, leadership and professional collaboration.

Working prototype, built for presentation at the **8th African Conference on
Emergency Medicine (AfCEM 2026), Arusha, 11–13 November 2026**.

**Live prototype:** _add the URL here once deployed_

---

## What is built

All eight sections of the specification are implemented.

| # | Section | State |
|---|---------|-------|
| 1 | Home | Live |
| 2 | About — vision, mission, pillars, core values | Live |
| 3 | Seven interconnected pillars, one page each | Live, content growing |
| 4 | Podcast and media — audio, video, live broadcast | Live, awaiting first recording |
| 5 | User profile | Built, needs Supabase connected |
| 6 | Discussion rooms and direct messages | Built, needs Supabase connected |
| 7 | Notifications | Built, needs Supabase connected |
| 8 | Join / register | Live |

Sections 5 to 7 need a database. Until one is connected the site runs in **preview
mode**: the interfaces render so the design can be reviewed and demonstrated, the
controls are disabled, and a banner says plainly that the data layer is not yet
switched on. Nothing is faked.

## Architecture

```
Browser (static HTML + ES modules, no build step)
   │
   ├── content.js   all site copy, in plain data structures
   ├── app.js       hash router + view rendering for the 8 sections
   └── api.js  ─────► Supabase
                       ├── Auth (magic link, no passwords)
                       ├── Postgres + row-level security
                       └── Realtime (posts, messages, notifications)
```

No framework, no bundler, no `node_modules` in production. The whole front end is
four files. This is deliberate: it loads on a phone on hospital wifi, and any
clinician who wants to edit the content can do it without a toolchain.

## Run it locally

```bash
git clone https://github.com/<you>/ave-forum.git
cd ave-forum
python3 -m http.server 8000     # any static server works
# open http://localhost:8000
```

ES modules require a server; opening `index.html` from the file system will not work.

## Deploy

Push to `main` and GitHub Actions publishes to Netlify. Two repository secrets are
needed: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.

For a first deploy without CI, drag the folder onto <https://app.netlify.com/drop>.

## Connect the database

1. Create a free project at <https://supabase.com>.
2. Open the SQL editor, paste `supabase/schema.sql`, run it once.
3. Copy the project URL and the **anon** key from Settings → API.
4. Paste both into `CONFIG` at the top of `assets/js/api.js`.
5. Commit and push.

The anon key belongs in client code — it is public by design. Row-level security in
`schema.sql` is what protects the data. **The `service_role` key must never appear
in this repository**; CI fails the build if it does.

After your first sign-in, make yourself a moderator:

```sql
update public.profiles set is_moderator = true where id = '<your-uuid>';
```

## Editing content

Everything readable on the site lives in `assets/js/content.js` as plain arrays and
objects: the seven pillars and their sub-topics, the vision and mission, core values,
podcast episodes, the research spotlight, country and role lists. No HTML required.

To publish an episode, change its `status` to `"published"` and add an `audio` or
`video` URL. `feed.xml` is a ready podcast RSS feed — fill in the domain, add an
`<item>` per episode, and submit the feed URL to Spotify for Podcasters and Apple
Podcasts Connect.

## Safety and data protection

This platform will carry clinical case discussion, which means it will attract
patient-identifiable information unless it is actively designed out. Three things are
in place and must stay:

- A standing no-PHI warning above every discussion room.
- A consent checkbox at registration that states the rule.
- Moderator removal, enforced in the database rather than the interface.

Still outstanding before public launch: a published privacy notice, a terms of use,
a named data controller, and a decision on where the data is hosted. Tanzania's
Personal Data Protection Act applies to a Tanzanian-operated platform collecting
personal data, and members will be joining from many jurisdictions.

## Repository layout

```
index.html                  page shell
assets/css/ave.css          design system: colours, type, components
assets/js/content.js        all editable content
assets/js/app.js            router and views
assets/js/api.js            Supabase: auth, profiles, posts, messages, notifications
assets/img/                 logo variants generated from the original artwork
supabase/schema.sql         tables, RLS policies, triggers, realtime
scripts/check-links.mjs     CI checks: assets, routes, no leaked keys
.github/workflows/deploy.yml  checks on every push, deploy on main
docs/ROADMAP.md             what ships when
feed.xml                    podcast RSS
```

## Design

Colours are sampled from the official logo artwork: deep navy `#031E3C` for trust,
emergency red `#C81418` for urgency, African gold `#D2A24E` for innovation, white for
clarity. Type is Archivo for interface and Source Serif 4 for reading, both with full
fallback stacks so the site renders correctly if webfonts are blocked.

The electrocardiographic waveform from the logo is used structurally — across the
hero and down the left of the pillar list — rather than as decoration.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests welcome from anyone
working in emergency care in Africa.

## Licence

Code: MIT. Content, branding and the AVE Forum logo: © 2026 AVE Forum, all rights
reserved. See [LICENSE](LICENSE).
