/* Repository checks run by GitHub Actions on every push and pull request.
   1. Every asset path referenced in index.html exists on disk.
   2. Every literal #/route in the source has a matching view.
   3. No Supabase service_role key has been committed to client code. */
import { readFileSync, existsSync } from "node:fs";

const html    = readFileSync("index.html", "utf8");
const app     = readFileSync("assets/js/app.js", "utf8");
const content = readFileSync("assets/js/content.js", "utf8");
const api     = readFileSync("assets/js/api.js", "utf8");

let fail = 0;
const bad = m => { console.error("FAIL:", m); fail++; };

/* 1. assets */
for (const m of html.matchAll(/(?:src|href|content)="(assets\/[^"]+)"/g)) {
  existsSync(m[1]) ? console.log("ok   asset", m[1]) : bad("missing asset " + m[1]);
}

/* 2. routes */
const pillarIds = [...content.matchAll(/\{ id:"([a-z]+)", n:"\d\d"/g)].map(m => m[1]);
if (pillarIds.length !== 7) bad(`expected 7 pillars in content.js, found ${pillarIds.length}`);
const known = new Set([
  "", "home", "about", "explore", "media", "events", "community",
  "profile", "discussion", "notifications", "register",
  ...pillarIds
]);
const routes = [...html.matchAll(/href="#\/([^"?]*)"/g), ...app.matchAll(/href="#\/([^"?`]*)["?]/g)]
  .map(m => m[1])
  .filter(r => !r.includes("${"))
  .map(r => r.replace(/\/$/, ""));
for (const r of new Set(routes)) {
  known.has(r) ? console.log("ok   route #/" + r) : bad("unknown route #/" + r);
}
console.log("ok   pillars:", pillarIds.join(", "));

/* 3. no service_role key in shipped JavaScript */
for (const jwt of api.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\./g)) {
  try {
    const claims = JSON.parse(Buffer.from(jwt[0].split(".")[1], "base64url").toString());
    if (claims.role && claims.role !== "anon") bad(`a '${claims.role}' key is committed in api.js`);
    else console.log("ok   only an anon key is present");
  } catch { /* not a JWT */ }
}

console.log(fail ? `\n${fail} problem(s)` : "\nAll checks passed");
process.exit(fail ? 1 : 0);
