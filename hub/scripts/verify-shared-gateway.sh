#!/bin/sh
set -eu
BASE_URL="${BASE_URL:-http://127.0.0.1:8780}"
node --input-type=module - "$BASE_URL" <<'NODE'
const base=process.argv[2];
const healthResponse=await fetch(`${base}/health`);
if(!healthResponse.ok) throw new Error(`portal health HTTP ${healthResponse.status}`);
const health=await healthResponse.json();
const response=await fetch(`${base}/api/shared-previews`);
if(!response.ok) throw new Error(`shared manifest HTTP ${response.status}`);
const manifest=await response.json();
const failures=[];
for(const app of manifest.previews){
  try { const r=await fetch(new URL(app.route,base)); const type=r.headers.get('content-type')||''; if(!r.ok||!type.includes('text/html')) failures.push(`${app.id}: HTTP ${r.status} ${type}`); }
  catch(e){failures.push(`${app.id}: ${e.message}`)}
}
console.log(`shared_gateway=${health.ok?'healthy':'failed'} routes=${manifest.count} checked=${manifest.previews.length} failures=${failures.length}`);
if(health.sharedStaticPreviews!==manifest.count) failures.push('health/manifest count mismatch');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
NODE
