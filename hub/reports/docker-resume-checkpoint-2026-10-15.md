# Docker + App Containers Resume Checkpoint — 2026-10-15

## Verified at checkpoint
- Docker Desktop engine responds; Docker client/server both report 29.8.2.
- `docker compose config --quiet` exits 0 for the hub's `compose.yaml`.
- Shared portal container `app-containers-portal` is Up (healthy), bound to `127.0.0.1:8780`.
- Nine runtime-specific app containers are Up (healthy): `app-anosera` (19100), `app-zehav` (19101), `app-tahnizhoo` (19102), `app-interactive-renders` (19103), `app-glowing-tardigrade` (19105), `app-todo-flow` (19106), `app-skyguard` (19110), `app-buildmaster` (19111), `app-magen-raki` (19112).
- Read-only HTTP smoke checks returned HTTP 200 on ports 8780, 19100, 19101, 19102, 19103, 19105, 19106, 19110, 19111, and 19112.
- 49 legacy `app-preview-*` containers are stopped (previously exited 0), not deleted; retain for rollback.
- Compose/runbook, export queue, portfolio checkpoint, and batch reports remain in this hub folder.

## Resume location and commands
Hub: `/Users/davidyoung/app-containers-hub`
Portal: `http://127.0.0.1:8780`
Portal health: `http://127.0.0.1:8780/health`
Registry: `http://127.0.0.1:8780/api/apps`
Shared previews: `http://127.0.0.1:8780/api/shared-previews`
Runbook: `RUNBOOK.md`
Source queue: `AISTUDIO-EXPORT-QUEUE.md`
Inventory/backlog: `reports/master-source-inventory-2026-10-15.md`, `reports/aistudio-export-backlog-2026-10-15.md`
Portfolio checkpoint: `reports/portfolio-batch-checkpoint-2026-10-15.md`

Safe read-only verification:
```sh
cd /Users/davidyoung/app-containers-hub
docker version --format 'client={{.Client.Version}} server={{.Server.Version}}'
docker compose config --quiet
docker compose ps -a
curl -fsS http://127.0.0.1:8780/health
curl -fsS http://127.0.0.1:8780/api/apps
```

## Explicitly not complete
- AI Studio rows 51–89 (39 rows / 38 unique IDs due duplicate AppForge row) still require exported source and exact project-ID matching. Do not containerize a name-only candidate or claim all 89 source projects are done.
- Stopped legacy previews are not counted as running. Current confirmed active set is 10 healthy containers (portal + nine app runtimes).
- This checkpoint verifies local Docker configuration/runtime and HTTP smoke responses only. It does not prove production readiness, auth/data security, or each app's live backend integrations.
- Preserve current containers and backups; no pruning, deletion, or main-branch merges as part of resume.

## Next work order
1. Resume from the AI Studio export queue at row 51; export in batches of five.
2. Match each exported project ID against the queue before changing or containerizing it.
3. Preserve original export, then test/fix in isolation and push to a secondary GitHub branch.
4. Add a report/checkpoint only after verification; leave Sapphire/OpenClaw and Orgo untouched without explicit authorization.
