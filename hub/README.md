# App Containers Hub

A local-first app registry and shared customer portal. Original app source directories remain in place and are mounted read-only for previews.

## Shared static preview gateway (preferred)

One `customer-portal` container serves the portal/API and routes eligible Google AI Studio static exports at `/preview/<project-id>/`. The 50 verified local static HTML exports are mounted read-only; the portal rewrites root-relative HTML/CSS asset paths so multiple apps can share one origin. This replaces a separate container per static preview. Node/backend apps remain separate when their runtime or isolation requires it.

```sh
cd /Users/davidyoung/app-containers-hub
npm run shared-gateway
# Validate Compose configuration without starting/recreating containers:
docker-compose -f compose.yaml config -q
```

Portal: http://localhost:8780
Health: http://localhost:8780/health
App registry API: http://localhost:8780/api/apps
Shared preview list: http://localhost:8780/api/shared-previews

Example preview route: `http://localhost:8780/preview/google-ai-studio-github-pull-aistudio-apps-02-phone-in-logs/`.

## Start / verify

```sh
scripts/start-all-verified.sh
scripts/verify-all.sh
```

Do not run the legacy per-preview generator unless intentionally returning to separate preview containers. It is retained as `npm run legacy-previews` for rollback/reference.

## Inventory reports

- `reports/master-source-inventory-2026-10-15.md` — human-readable master inventory.
- `reports/master-source-inventory-2026-10-15.csv` and `.json` — complete registry export.
- `reports/aistudio-export-backlog-2026-10-15.md` — all 89 AI Studio source rows and remaining export/identity checks.

## Status and limits

The registry includes 89 Google AI Studio page rows with 88 unique source IDs. Only 50 local static exports are available for this shared preview route; the remaining source projects still need exact exports. Same-name matches are not proof of identity. The gateway provides static previews, not a claim that each app is production-ready. API keys, auth, databases, storage, billing, integrations, and security testing must be configured and verified per app. Do not put secrets in images or the public registry.

## Inventory rescan safety

`npm run inventory` merges new scans into the curated registry and preserves source-page rows, cloud links, static exports, and build/preview metadata. `npm run report` regenerates the master Markdown/CSV/JSON inventory and AI Studio export backlog.
