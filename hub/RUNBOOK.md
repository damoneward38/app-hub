# App Containers Hub — Runbook

## Shared gateway architecture
- Portal / shared static gateway: http://localhost:8780
- Health: http://localhost:8780/health
- API registry: http://localhost:8780/api/apps
- Shared preview manifest: http://localhost:8780/api/shared-previews
- 122 app exports are mounted read-only into the portal container and routed through `/preview/<project-id>/` (85 Google AI Studio, 6 Base44, 31 other local app exports).
- Static previews share one container; Node apps with distinct runtime needs remain separate.
- Original project folders are not moved or modified by the gateway.

## Regenerate and validate
```sh
cd /Users/davidyoung/app-containers-hub
npm run shared-gateway
docker-compose -f compose.yaml config -q
```

## Start / verify
```sh
scripts/start-all-verified.sh
scripts/verify-all.sh
```

## Current runtime blocker (2026-10-15)
Docker Desktop was restarted successfully after the VM stopped. The Docker API is healthy. The shared gateway is deployed and all 51 static routes pass; 49 legacy per-app static preview containers are stopped (not deleted) for rollback.

## Source coverage
The authenticated AI Studio page has 89 rows and 88 unique project IDs. All 89 source-page rows are now represented separately from 50 local export candidates. One additional AI Studio project found in browser history beyond the 89-row list, two Base44 cloud projects, and two Rork cloud project links are also tracked. Exact source-to-export identity remains unverified; name matches are candidates only. The KELI isolated build previously failed because the host volume was nearly full; avoid large batch builds until free space is recovered.

## Security / readiness
Ports bind to 127.0.0.1. Static source mounts are read-only. The portal uses a non-root Node runtime, read-only container filesystem, dropped Linux capabilities, no-new-privileges, and a health check. Static preview is not production readiness. API keys, authentication, databases, persistent storage, billing, external integrations, and per-app security testing remain per-project tasks.

## Master inventory artifacts
- `reports/master-source-inventory-2026-10-15.md`
- `reports/master-source-inventory-2026-10-15.csv`
- `reports/master-source-inventory-2026-10-15.json`
- `reports/aistudio-export-backlog-2026-10-15.md`

## Current deployment state
- Shared portal: `http://localhost:8780`
- Shared static routes: 122/122 verified (85 AI Studio + 6 Base44 + 31 other local app exports).
- Running Docker containers: 11/11 healthy (shared portal + 10 runtime-specific app containers).
- Legacy `app-preview-*` containers: stopped, not deleted; available for rollback.
- Base44: all 6 projects served (Trellix, Hub gallery, Buzz extension showcase, Tiny white-label landing, ForgeAI and FreeCast reconstructed).
