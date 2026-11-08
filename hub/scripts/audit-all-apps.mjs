import fs from "node:fs";
import path from "node:path";

const hub = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const inventoryPath = path.join(hub, "public/apps.json");
const inventoryJson = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const records = Array.isArray(inventoryJson) ? inventoryJson : (inventoryJson.apps ?? []);
const roots = new Map();
for (const record of records) {
  const sourcePath = typeof record.path === "string" ? record.path : "";
  if (!sourcePath.startsWith("/")) continue;
  const key = path.resolve(sourcePath);
  if (!roots.has(key)) roots.set(key, []);
  roots.get(key).push(record);
}
const skip = new Set(["node_modules", ".git", ".expo", ".next", ".turbo", "coverage", "dist", "build", ".cache"]);
const codeExt = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".html"]);
function walk(root) {
  const files = [];
  const stack = [{ dir: root, depth: 0 }];
  while (stack.length && files.length < 4000) {
    const { dir, depth } = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!skip.has(entry.name) && !entry.name.startsWith(".") && depth < 8) stack.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
      } else if (entry.isFile() && codeExt.has(path.extname(entry.name).toLowerCase())) {
        files.push(path.join(dir, entry.name));
      }
    }
  }
  return files;
}
const results = [];
for (const [root, linked] of roots) {
  if (!fs.existsSync(root)) {
    results.push({ root, names: linked.map(x => x.name).filter(Boolean), status: "MISSING_PATH", files: 0, buttons: 0, routes: 0, api: 0, todo: 0, packageJson: false, depsInstalled: false });
    continue;
  }
  const stat = fs.statSync(root);
  const dir = stat.isDirectory() ? root : path.dirname(root);
  const files = walk(dir);
  let buttons = 0, routes = 0, api = 0, todo = 0, html = 0, ts = 0;
  for (const file of files) {
    let s;
    try { s = fs.readFileSync(file, "utf8"); } catch { continue; }
    const ext = path.extname(file).toLowerCase();
    if (ext === ".html") html++;
    if (ext === ".ts" || ext === ".tsx") ts++;
    buttons += (s.match(/\bon(?:Press|Click|Submit|Change)\s*=/g) ?? []).length;
    buttons += (s.match(/\baddEventListener\s*\(\s*["']click["']/g) ?? []).length;
    routes += (s.match(/router\.(?:push|replace|back|navigate)\s*\(/g) ?? []).length;
    routes += (s.match(/<(?:Route|Link|NavLink)\b/g) ?? []).length;
    api += (s.match(/\bfetch\s*\(|axios\.|\.useQuery\(|\.useMutation\(/g) ?? []).length;
    todo += (s.match(/\b(?:TODO|FIXME|XXX)\b/g) ?? []).length;
  }
  const pkgPath = path.join(dir, "package.json");
  let pkg = null;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")); } catch {}
  results.push({
    root: dir,
    names: [...new Set(linked.map(x => x.name).filter(Boolean))],
    status: stat.isDirectory() ? "SCANNED" : "FILE_PATH",
    files: files.length, ts, html, buttons, routes, api, todo,
    packageJson: !!pkg,
    packageName: pkg?.name ?? "",
    scripts: Object.keys(pkg?.scripts ?? {}),
    depsInstalled: fs.existsSync(path.join(dir, "node_modules")),
    sampleFile: files[0] ? path.relative(dir, files[0]) : ""
  });
}
const sourceRoots = results.filter(x => x.status === "SCANNED");
const withCode = sourceRoots.filter(x => x.files > 0);
const packageRoots = sourceRoots.filter(x => x.packageJson);
const missing = results.filter(x => x.status === "MISSING_PATH");
const total = key => results.reduce((n, x) => n + (x[key] || 0), 0);
const reportPath = path.join(hub, "reports", "all-apps-static-audit-2026-10-15.md");
const out = [
  "# All Apps — Static Audit Inventory",
  "",
  "- Scope: every unique absolute local path in public/apps.json; no source files modified by this scanner.",
  `- Inventory records: ${records.length}`,
  `- Unique local paths: ${roots.size}`,
  `- Existing paths scanned: ${sourceRoots.length}`,
  `- Paths with source-like files: ${withCode.length}`,
  `- Roots with package.json: ${packageRoots.length}`,
  `- Roots with node_modules available: ${sourceRoots.filter(x => x.depsInstalled).length}`,
  `- Missing paths: ${missing.length}`,
  `- Static control/event bindings found: ${total("buttons")}`,
  `- Router/navigation patterns found: ${total("routes")}`,
  `- API/query/mutation patterns found: ${total("api")}`,
  `- TODO/FIXME/XXX markers found: ${total("todo")}`,
  "",
  "## Per-source-root results",
  "",
  "| Project(s) | Path | Files | TS/TSX | HTML | Controls | Routes | API markers | TODO markers | Package | Dependencies |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|",
];
for (const x of results.sort((a,b) => a.root.localeCompare(b.root))) {
  const names = (x.names.length ? x.names.join(", ") : "(unnamed)").replace(/\|/g, "\\|");
  out.push(`| ${names} | ${x.root.replace(/\|/g, "\\|")} | ${x.files} | ${x.ts ?? 0} | ${x.html ?? 0} | ${x.buttons} | ${x.routes} | ${x.api} | ${x.todo} | ${x.packageJson ? x.packageName || "yes" : "no"} | ${x.depsInstalled ? "installed" : "missing"} |`);
}
out.push(
  "",
  "## Interpretation and limits",
  "",
  "- This is a static inventory, not a passing functional audit. Counts indicate code patterns, not successful behavior.",
  "- Static HTML exports are not treated as original source identity; source IDs still require export identity verification.",
  "- Build/typecheck/lint tests are only possible for roots with compatible dependencies and scripts. This scan does not install packages or launch apps.",
  "- Authentication, payments, database writes, uploads, external API calls, and destructive actions require isolated test data and service credentials before live interaction tests.",
  "- Missing source exports and cloud-only apps must be exported from their authenticated source platforms before code-level fixes can be verified.",
  ""
);
fs.writeFileSync(reportPath, out.join("\n"));
console.log(`REPORT=${reportPath}`);
console.log(`SUMMARY records=${records.length} unique_paths=${roots.size} existing=${sourceRoots.length} with_code=${withCode.length} packages=${packageRoots.length} dependencies_installed=${sourceRoots.filter(x => x.depsInstalled).length} missing_paths=${missing.length}`);
console.log(`STATIC totals controls=${total("buttons")} navigation=${total("routes")} api_markers=${total("api")} todo_markers=${total("todo")}`);
console.log("TOP ROOTS WITH SOURCE / CONTROLS:");
for (const x of results.filter(x => x.files).sort((a,b) => (b.buttons+b.routes+b.api)-(a.buttons+a.routes+a.api)).slice(0,15)) {
  console.log(`- ${x.names.join(", ") || x.root}: files=${x.files} controls=${x.buttons} routes=${x.routes} api=${x.api} package=${x.packageJson} deps=${x.depsInstalled}`);
}
