import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const registryPath = path.join(root, 'public', 'apps.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const aiStudioExports = registry.apps.filter(app =>
  app.source === 'Google AI Studio' &&
  app.status !== 'TOOL_OR_DUPLICATE' &&
  app.evidence?.htmlEntry &&
  !app.evidence?.packageJson &&
  typeof app.path === 'string' &&
  fs.existsSync(path.join(app.path, 'index.html'))
);
const builtStaticExports = registry.apps.filter(app =>
  typeof app.staticExportPath === 'string' &&
  fs.existsSync(path.join(app.staticExportPath, 'index.html'))
);
const eligible = [...aiStudioExports, ...builtStaticExports];
const seen = new Set();
const entries = [];
for (const app of eligible) {
  if (seen.has(app.id)) continue;
  seen.add(app.id);
  const sourcePath = app.staticExportPath || app.path;
  const mountPath = `/app/previews/${app.id}`;
  const previous = app.preview || {};
  app.preview = {
    ...previous,
    legacyUrl: previous.legacyUrl || previous.url || null,
    legacyPort: previous.legacyPort || previous.port || null,
    sharedGateway: true,
    route: `/preview/${app.id}/`,
    url: `/preview/${app.id}/`,
    mountPath,
    note: app.staticExportPath ? 'Built web export served read-only; original Rork source remains in its source repository.' : 'Served by the shared read-only static gateway; original source folder remains in place.'
  };
  app.preview.sourceType = app.staticExportPath ? 'built-web-export' : 'local-static-export';
  delete app.preview.startCommand;
  entries.push({ id: app.id, name: app.name, route: app.preview.route, mountPath, sourceType: app.preview.sourceType });
}
for (const app of registry.apps) {
  if (app.source === 'Google AI Studio' && app.preview && !app.preview.sharedGateway) {
    app.preview.sharedGateway = false;
  }
}
registry.sharedStaticGateway = {
  enabled: true,
  routePrefix: '/preview/:projectId/',
  uniqueStaticExports: entries.length,
  sourceFoldersMountedReadOnly: true,
  originalsModified: false,
  aiStudioExports: aiStudioExports.length,
  additionalBuiltStaticExports: builtStaticExports.length
};
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'public', 'shared-static-previews.json'), JSON.stringify(entries, null, 2) + '\n');

const composePath = path.join(root, 'compose.yaml');
let compose = fs.readFileSync(composePath, 'utf8');
compose = compose.replace(/\n    volumes:\n(?:      - .*\n)+(?=    read_only:)/, '\n');
const mounts = entries.map(e => { const app = registry.apps.find(a => a.id === e.id); const sourcePath = app.staticExportPath || app.path; return `      - ${JSON.stringify(`${sourcePath}:${e.mountPath}:ro`)}`; }).join('\n');
const volumeBlock = `\n    volumes:\n${mounts}\n`;
if (/^    volumes:/m.test(compose)) {
  compose = compose.replace(/^    volumes:\n(?:      - .*\n)*/m, volumeBlock);
} else {
  compose = compose.replace(/^(    read_only: true)$/m, `${volumeBlock}$1`);
}
fs.writeFileSync(composePath, compose);
console.log(JSON.stringify({ gateway: 'shared-static', uniqueExports: entries.length, aiStudioExports: aiStudioExports.length, additionalBuiltStaticExports: builtStaticExports.length, composeMounts: entries.length, map: 'public/shared-static-previews.json', compose: 'compose.yaml', urls: entries.length ? ['http://localhost:8780' + entries[0].route, 'http://localhost:8780' + entries.at(-1).route] : [] }, null, 2));
