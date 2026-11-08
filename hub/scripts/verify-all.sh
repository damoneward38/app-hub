#!/bin/sh
set -eu
BASE_URL="${BASE_URL:-http://127.0.0.1:8780}"
node --input-type=module - "$BASE_URL" <<'NODE'
import process from 'node:process';
const base=process.argv[2];
const health=await fetch(`${base}/health`);
if(!health.ok) throw new Error(`portal health HTTP ${health.status}`);
const h=await health.json();
const manifestResponse=await fetch(`${base}/api/shared-previews`);
if(!manifestResponse.ok) throw new Error(`shared manifest HTTP ${manifestResponse.status}`);
const manifest=await manifestResponse.json();
let failed=[];
for(const app of manifest.previews){
  try { const r=await fetch(new URL(app.route,base)); const type=r.headers.get('content-type')||''; if(!r.ok||!type.includes('text/html')) failed.push(`${app.id}: HTTP ${r.status} ${type}`); }
  catch(e){failed.push(`${app.id}: ${e.message}`)}
}
console.log(`portal=healthy shared_static_routes=${manifest.count} checked=${manifest.previews.length} failures=${failed.length}`);
if(failed.length){console.error(failed.join('\n'));process.exit(1)}
if(h.sharedStaticPreviews!==manifest.count) throw new Error('health/manifest preview count mismatch');
NODE
for port in 19100 19101 19102 19103 19105 19106 19110 19111 19112; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 4 "http://127.0.0.1:$port/")
  [ "$code" = "200" ] || { echo "FAIL port=$port http=$code"; exit 1; }
done
# Give the just-recreated portal healthcheck a short window to turn healthy.
health=""
for attempt in $(seq 1 15); do
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' app-containers-portal 2>/dev/null || true)
  [ "$health" = "healthy" ] && break
  sleep 1
done
[ "$health" = "healthy" ] || { echo "FAIL: app-containers-portal health=$health"; exit 1; }
python3 - <<'PY'
import json, subprocess
ids=subprocess.check_output(['docker','ps','-q','--filter','name=app-'],text=True).split()
details=[]
for cid in ids:
 d=json.loads(subprocess.check_output(['docker','inspect',cid],text=True))[0]
 state=d['State']; name=d['Name'].lstrip('/')
 health=state.get('Health',{}).get('Status','no-healthcheck')
 details.append((name,state['Status'],health))
bad=[x for x in details if x[1]!='running' or x[2] not in ('healthy','no-healthcheck')]
print(f'app_containers_running={len(details)} healthy={sum(x[1]=="running" and x[2]=="healthy" for x in details)} non_healthy={len(bad)}')
if bad:
 print('FAILURES:',bad)
 raise SystemExit(1)
print('PASS: shared static routes, production app endpoints, and app-container states verified')
PY
