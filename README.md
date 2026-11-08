# App Hub — AI Studio · Base44 · Rork · Manus

Unified local portal and catalogs for 102 working apps across four build platforms.

## What is here

| Path | Contents |
| --- | --- |
| `hub/` | Node/Express portal + Docker compose, app registry (`public/apps.json`), unified landing page (`public/index.html`), shared static gateway builder, verification scripts. |
| `catalogs/` | Per-platform app catalogs and the combined 102-app index (`APP-HUB.md`). |
| `generated-apps/` | Local AI Studio generated exports (`as-*`) served by the hub. |
| `exports/app-exports/` | Exported app bundles (Rork, Base44, Manus, and others). |
| `exports/base44/` | Base44 built exports. |
| `exports/manus/` | Manus AI exports (e.g. `manus-streamwave`). |

## Verified state (2026-11-08)

- Served apps: **102** — Google AI Studio 85, Base44 7, Rork 5, Manus AI 5.
- Shared static routes: **124**, all HTTP 200 (`scripts/verify-all.sh`).
- Containers: **11/11 healthy**.
- App QA checklists: **600/600 items recorded, 0 unchecked** across 50 AI Studio app READMEs.

## Run the portal

Requires Docker Desktop.

```bash
cd hub
docker compose build customer-portal
docker compose up -d customer-portal
```

Open http://localhost:8780.

`hub/compose.yaml` contains absolute host paths from the machine where the apps
were exported. Adjust the volume mounts before running on another machine.

## Notes

- `public/` is copied into the image (`COPY public ./public`); after editing
  `public/apps.json`, `public/index.html`, or `public/shared-static-previews.json`
  rebuild the `customer-portal` image.
- Payment provider credentials are **not** included; configure your own before
  enabling paid flows.
- Media render outputs (`*.mp4`, `*.mov`) and `node_modules/` are excluded.
