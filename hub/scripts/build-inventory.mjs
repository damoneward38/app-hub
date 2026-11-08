import fs from "node:fs";
import path from "node:path";

const home = "/Users/davidyoung";
const out = path.join(home, "app-containers-hub", "public", "apps.json");
const existingRegistry = (() => { try { return JSON.parse(fs.readFileSync(out, "utf8")); } catch { return { apps: [], summary: {} }; } })();
const roots = [
  { path: path.join(home, "GitHub-Pull", "AISTUDIO-APPS"), source: "Google AI Studio" },
  { path: path.join(home, "GitHub-Pull", "RORK-APPS"), source: "Rork" },
  { path: path.join(home, "GitHub-Pull", "BASE44-APPS"), source: "Base44" },
  { path: path.join(home, "apps"), source: "Local apps" },
  { path: path.join(home, "dyad-apps"), source: "Dyad/local exports" }
];
const exists = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const has = (p, name) => fs.existsSync(path.join(p, name));
const read = p => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };
const apps = [];
const excludedNames = new Set(["pulled", "sapphire-main", "sapphire-openclaw", "node_modules", ".git"]);
for (const sourceRoot of roots) {
  if (!exists(sourceRoot.path)) continue;
  let entries = [];
  try { entries = fs.readdirSync(sourceRoot.path, { withFileTypes: true }); } catch { continue; }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith(".") || excludedNames.has(ent.name)) continue;
    const p = path.join(sourceRoot.path, ent.name);
    const packagePath = path.join(p, "package.json");
    const packageData = has(p, "package.json") ? (() => { try { return JSON.parse(read(packagePath)); } catch { return {}; } })() : {};
    const docker = has(p, "Dockerfile") || has(p, "dockerfile") || has(p, "compose.yaml") || has(p, "docker-compose.yml");
    const webEntry = has(p, "index.html") || has(p, "src") || has(p, "app") || has(p, "pages") || has(p, "expo") || has(p, "backend");
    const appManifest = has(p, "package.json") || has(p, "rork.json") || has(p, "_manifest.json") || has(p, "vite.config.ts") || has(p, "vite.config.js") || has(p, "next.config.js") || has(p, "next.config.mjs") || has(p, "requirements.txt") || has(p, "pyproject.toml") || has(p, "go.mod");
    const toolLike = /(^|[-_])(sdk|cli|examples?|skills|starter|template|router-server|server|tooling)([-_]|$)/i.test(ent.name);
    if (!webEntry && !appManifest && !docker) continue;
    let status = "NEEDS_CONVERSION";
    let reason = "App-like source found; Dockerfile, runtime, ports, and health check still need to be defined.";
    if (docker) { status = "NEEDS_REVIEW"; reason = "Container configuration exists; build, startup, and health checks are not yet verified."; }
    else if (!appManifest) { status = "NEEDS_REVIEW"; reason = "Exported HTML/source files found; confirm this is a runnable app and not a code archive."; }
    if (toolLike) { status = "TOOL_OR_DUPLICATE"; reason = "Name suggests infrastructure, SDK, example, template, or support service; exclude from customer-app count pending review."; }
    apps.push({
      id: sourceRoot.source.toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-" + ent.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
      name: packageData.name || ent.name.replace(/^\d+-/, "").replace(/[-_]+/g, " "),
      source: sourceRoot.source,
      path: p,
      status,
      reason,
      evidence: { packageJson: has(p, "package.json"), htmlEntry: has(p, "index.html"), dockerConfig: docker, gitRepository: has(p, ".git") }
    });
  }
}
const seen = new Map();
for (const app of apps) {
  const key = app.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (seen.has(key)) {
    app.status = "TOOL_OR_DUPLICATE";
    app.reason = "Name collision with another discovered project; compare source before selecting a canonical copy.";
    const prev = apps[seen.get(key)];
    prev.status = "TOOL_OR_DUPLICATE";
    prev.reason = "Name collision with another discovered project; compare source before selecting a canonical copy.";
  } else seen.set(key, apps.indexOf(app));
}
// Merge the scan with the curated registry instead of overwriting source-page IDs,
// cloud links, build exports, previews, and records from folders not scanned above.
const mergedApps = [];
const matchedExistingIds = new Set();
for (const scanned of apps) {
  const prior = (existingRegistry.apps || []).find(x => x.source === scanned.source && x.path === scanned.path && !matchedExistingIds.has(x.id));
  if (prior) {
    matchedExistingIds.add(prior.id);
    mergedApps.push({ ...scanned, ...prior, id: prior.id, source: scanned.source, path: scanned.path, evidence: { ...(scanned.evidence || {}), ...(prior.evidence || {}) } });
  } else {
    mergedApps.push(scanned);
  }
}
for (const prior of (existingRegistry.apps || [])) {
  if (matchedExistingIds.has(prior.id)) continue;
  if (mergedApps.some(x => x.id === prior.id)) continue;
  if (prior.path && mergedApps.some(x => x.source === prior.source && x.path === prior.path)) continue;
  mergedApps.push(prior);
}
const bySource = {};
const statusCounts = {};
for (const app of mergedApps) {
  const group = app.sourceGroup || app.source || "Local";
  bySource[group] = (bySource[group] || 0) + 1;
  statusCounts[app.status || "NEEDS_REVIEW"] = (statusCounts[app.status || "NEEDS_REVIEW"] || 0) + 1;
}
const summary = {
  ...(existingRegistry.summary || {}),
  projectsDiscovered: mergedApps.length,
  ready: mergedApps.filter(a => a.status === "READY").length,
  needsFix: mergedApps.filter(a => a.status === "NEEDS_FIX").length,
  needsConversion: mergedApps.filter(a => a.status === "NEEDS_CONVERSION").length,
  needsReview: mergedApps.filter(a => a.status === "NEEDS_REVIEW").length,
  excludedToolsOrDuplicates: mergedApps.filter(a => a.status === "TOOL_OR_DUPLICATE").length,
  bySource,
  statusCounts
};
const registry = {
  ...existingRegistry,
  generatedAt: new Date().toISOString(),
  status: "inventory-rescanned-source-metadata-preserved",
  summary,
  apps: mergedApps
};
fs.writeFileSync(out, JSON.stringify(registry, null, 2) + "\n");
console.log(JSON.stringify({ output: out, summary, totalRecords: mergedApps.length, preservedExistingRecords: (existingRegistry.apps || []).length, mergedRecords: matchedExistingIds.size }, null, 2));
