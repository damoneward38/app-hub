import fs from 'node:fs';
const registry = JSON.parse(fs.readFileSync('public/apps.json', 'utf8'));
const apps = registry.apps;
const sourceRows = apps.filter(a => a.recordType === 'SOURCE_PAGE_ROW').sort((a,b) => a.sourceOrdinal - b.sourceOrdinal);
const sourceIds = new Set(sourceRows.map(a => a.sourceProjectId).filter(Boolean));
const statusCounts = {};
for (const a of sourceRows) statusCounts[a.status || 'NEEDS_REVIEW'] = (statusCounts[a.status || 'NEEDS_REVIEW'] || 0) + 1;
const columns = ['id','name','source','sourceGroup','recordType','status','sourceOrdinal','sourceProjectId','cloudProjectId','sourceUrl','liveUrl','previewUrl','path','staticExportPath','candidatePaths','relatedLocalCandidates','reason'];
const csvValue = value => {
  const s = Array.isArray(value) ? value.join(' ; ') : value === undefined || value === null ? '' : String(value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
fs.writeFileSync('reports/master-source-inventory-2026-10-15.csv', [columns.join(','), ...apps.map(a => columns.map(k => csvValue(a[k])).join(','))].join('\n') + '\n');
fs.writeFileSync('reports/master-source-inventory-2026-10-15.json', JSON.stringify({generatedAt:registry.generatedAt, summary:registry.summary, sharedStaticGateway:registry.sharedStaticGateway, apps}, null, 2) + '\n');
const md = [];
md.push('# Master App Source Inventory — 2026-10-15','',
  '- Inventory records: ' + apps.length,
  '- Google AI Studio source-page rows: ' + sourceRows.length,
  '- Unique source IDs across the 89-row list: ' + sourceIds.size,
  '- Local AI Studio export candidates: ' + apps.filter(a => a.recordType === 'LOCAL_EXPORT_CANDIDATE').length,
  '- Additional AI Studio projects from browser history: ' + apps.filter(a => a.recordType === 'BROWSER_HISTORY_PROJECT').length,
  '- Base44 cloud projects linked: ' + apps.filter(a => a.recordType === 'CLOUD_APP_LINK' && a.source === 'Base44').length,
  '- Rork cloud project links attached to local repos: ' + apps.filter(a => a.source === 'Rork' && a.cloudProjectId).length,
  '- Shared static routes: ' + (registry.sharedStaticGateway?.uniqueStaticExports || 0),
  '- Exact AI Studio source-to-export identity checks passed: ' + (registry.summary.googleAiStudioExactSourceExportsVerified || 0),
  '- Docker engine: ' + (registry.summary.dockerEngineStatus || 'unknown'),
  '- Running containers at last verification: ' + (registry.summary.runningContainerCount ?? 'unknown'),
  '', '## Source-page status counts', '');
for (const [k,v] of Object.entries(statusCounts)) md.push('- ' + k + ': ' + v);
md.push('', '## All 89 Google AI Studio source page rows', '', '| Row | Project | Source project ID | Status | Local candidates | Source URL |', '|---:|---|---|---|---|---|');
for (const a of sourceRows) {
  const candidates = [...(a.candidatePaths || []), ...(a.relatedLocalCandidates || [])].join('; ');
  md.push('| ' + a.sourceOrdinal + ' | ' + String(a.name || '').replace(/\|/g, '\\|') + ' | `' + (a.sourceProjectId || '') + '` | ' + a.status + ' | ' + (candidates ? candidates.replace(/\|/g, '\\|') : 'None recorded') + ' | [Open source](' + a.sourceUrl + ') |');
}
md.push('', '## Additional cloud projects and built exports', '');
for (const a of apps.filter(a => a.recordType === 'BROWSER_HISTORY_PROJECT' || a.recordType === 'CLOUD_APP_LINK' || a.cloudProjectId || a.staticExportPath)) {
  let line = '- **' + a.name + '** (' + a.source + ') — ' + a.status;
  if (a.sourceUrl) line += '; [source link](' + a.sourceUrl + ')';
  if (a.liveUrl) line += '; [hosted app](' + a.liveUrl + ')';
  if (a.previewUrl) line += '; [hosted preview](' + a.previewUrl + ')';
  if (a.preview?.sharedGateway) line += '; [shared preview](http://localhost:8780' + a.preview.route + ')';
  if (a.path) line += '; local path: `' + a.path + '`';
  md.push(line);
}
md.push('', '## Readiness notes', '',
  '- The 89 source page rows are retained separately from the 50 local export candidates so same-name matches do not silently become verified source identities.',
  '- Local source folders are mounted read-only for static previews; originals remain in place.',
  '- A source URL or name match is not proof that code has been exported, built, or production-tested.',
  '- Base44 cloud source code exports remain outstanding; ForgeAI hosted app and ForgeAI/FreeCast previews were reachable during verification.',
  '- Rork No-Backend App with Supabase has a verified static Expo web preview; Rork AI/chat and native-only features still need functional tests.',
  '- Forty-nine legacy per-app static preview containers are stopped, not deleted, for rollback.');
fs.writeFileSync('reports/master-source-inventory-2026-10-15.md', md.join('\n') + '\n');
const backlog = ['# Google AI Studio Export and Identity Verification Backlog','',
  'Rows: ' + sourceRows.length + '; unique IDs: ' + sourceIds.size + '; exact source-to-export identity checks passed: ' + (registry.summary.googleAiStudioExactSourceExportsVerified || 0) + '.',
  'Status totals: ' + Object.entries(statusCounts).map(([k,v]) => k + '=' + v).join(', '), '', '## Per-project follow-up', ''];
for (const a of sourceRows) {
  const candidates = (a.candidatePaths || []).join(', ');
  backlog.push('- [ ] Row ' + a.sourceOrdinal + ': **' + a.name + '** — ' + a.status + '; ID `' + a.sourceProjectId + '`; ' + (candidates ? 'candidate path(s): ' + candidates : 'no exact-name local candidate') + '; [open source](' + a.sourceUrl + ')');
}
backlog.push('', '## Completion gate', '', 'Export each unique source project from its authenticated source page, compare source ID/metadata, preserve the downloaded original, record its path, classify static vs Node/backend runtime, then build and HTTP/health test. Do not mark same-name candidates verified until source identity is confirmed.');
fs.writeFileSync('reports/aistudio-export-backlog-2026-10-15.md', backlog.join('\n') + '\n');
console.log(JSON.stringify({inventoryRows:apps.length,sourceRows:sourceRows.length,uniqueSourceIds:sourceIds.size,sharedRoutes:registry.sharedStaticGateway?.uniqueStaticExports,files:['reports/master-source-inventory-2026-10-15.md','reports/master-source-inventory-2026-10-15.csv','reports/master-source-inventory-2026-10-15.json','reports/aistudio-export-backlog-2026-10-15.md']},null,2));
