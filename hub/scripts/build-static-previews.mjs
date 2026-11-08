import fs from "node:fs";
import path from "node:path";

const root = "/Users/davidyoung/app-containers-hub";
const registryPath = path.join(root, "public", "apps.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const eligible = registry.apps.filter(a =>
  a.source === "Google AI Studio" &&
  a.status !== "TOOL_OR_DUPLICATE" &&
  a.evidence?.htmlEntry &&
  !a.evidence?.packageJson &&
  fs.existsSync(path.join(a.path, "index.html"))
);
const quote = s => JSON.stringify(String(s));
const services = [];
eligible.forEach((app, i) => {
  const n = i + 1;
  const slug = app.id.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const service = "studio_" + String(n).padStart(2, "0") + "_" + slug.replace(/-/g, "_").slice(0, 35);
  const profile = "preview-" + slug.slice(0, 45);
  const port = 19000 + i;
  app.preview = {
    type: "static-html",
    service,
    profile,
    port,
    url: "http://127.0.0.1:" + port + "/",
    startCommand: "docker compose -f compose.yaml -f compose.apps.yaml --profile " + profile + " up -d " + service,
    note: "On-demand static preview; not running until explicitly started."
  };
  services.push(
    "  " + service + ":\n" +
    "    image: nginxinc/nginx-unprivileged:alpine\n" +
    "    container_name: " + quote("app-preview-" + String(n).padStart(2, "0")) + "\n" +
    "    profiles: [" + quote(profile) + "]\n" +
    "    restart: unless-stopped\n" +
    "    ports:\n" +
    "      - " + quote("127.0.0.1:" + port + ":8080") + "\n" +
    "    volumes:\n" +
    "      - " + quote(app.path + ":/usr/share/nginx/html:ro") + "\n" +
    "      - " + quote(path.join(root, "nginx-static.conf") + ":/etc/nginx/conf.d/default.conf:ro") + "\n" +
    "    read_only: true\n" +
    "    tmpfs: [\"/tmp:size=16m,noexec,nosuid\"]\n" +
    "    security_opt: [\"no-new-privileges:true\"]\n" +
    "    cap_drop: [\"ALL\"]\n" +
    "    healthcheck:\n" +
    "      test: [\"CMD-SHELL\", \"wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1\"]\n" +
    "      interval: 20s\n" +
    "      timeout: 3s\n" +
    "      retries: 3\n" +
    "      start_period: 5s"
  );
});
for (const app of registry.apps) {
  if (!app.preview) app.preview = null;
}
registry.status = "inventory-and-on-demand-static-previews-generated";
registry.previewSummary = {
  staticPreviewServicesGenerated: eligible.length,
  autoStarted: 0,
  portRange: eligible.length ? "127.0.0.1:19000-" + (19000 + eligible.length - 1) : null,
  mode: "on-demand profiles; source folders mounted read-only; originals not copied or modified"
};
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
const compose = "name: app-project-previews\nservices:\n" + services.join("\n") + "\n";
fs.writeFileSync(path.join(root, "compose.apps.yaml"), compose);
console.log(JSON.stringify({ generated: eligible.length, servicesFile: path.join(root, "compose.apps.yaml"), previewSummary: registry.previewSummary }, null, 2));
