# App Security, Persistence, and Documentation Baseline
Date: 2026-10-15

## Scope and evidence

This pass covered the 50 local export folders under:
`/Users/davidyoung/GitHub-Pull/AISTUDIO-APPS`

The existing master inventory separately records 89 Google AI Studio source-page rows (88 unique source IDs), 50 local export candidates, and 51 shared static routes. This report does not treat the 50 local folders as the entire portfolio and does not claim that the remaining source-page rows are exported or identity-verified.

## Completed documentation work

- Verified 50/50 local export folders have a top-level `index.html`.
- Verified no top-level `index.html` was missing or below 500 bytes in the static scan.
- Added full project-specific README documentation to 26 folders that lacked a README.
- Expanded 24 existing README files that were under 1,000 bytes.
- Preserved the previous versions of those 24 existing README files in:
  `/Users/davidyoung/app-containers-hub/backups/readme-expansion-before-20261015/`
- Post-change verification: 50/50 folders have a README and 50/50 have an index.html. No README is missing.

README files document actual limitations and contain verification checklists. They do not create authentication, storage, or backend functionality.

## Static indicator counts (not a security certification)

A pre-documentation text scan of the 50 HTML export folders found:
- Authentication-related text markers: 17 apps
- Admin-related text markers: 9 apps
- Persistence/storage-related text markers: 16 apps
- API/backend-related text markers: 11 apps

These are search indicators only. They do not establish that authentication is server-enforced, sessions are isolated, admins are protected, APIs authorize requests, or saved work survives reload/sign-out. A static export may show UI labels without any secure implementation.

## Required security and persistence acceptance criteria for every app

1. **Identity:** use a trusted identity provider or correctly hashed passwords; never plaintext passwords.
2. **Admin access:** server-side role assignment and authorization for every admin API/action. A hidden button or browser-side flag is not access control.
3. **Session safety:** secure session/token handling, expiry, logout/revocation, and protection against session fixation/replay as applicable.
4. **User isolation:** every database query and file operation is scoped to the authenticated user/tenant; attempts to swap IDs must be denied.
5. **Durable saves:** persist user-created work to a database or controlled file/object store; confirm save success only after the backend confirms it.
6. **File access:** server-generated storage keys, type/size validation, path traversal protection, private-by-default permissions, and authorized download/delete.
7. **Recovery:** backups and a tested restore process; work must survive reload, logout/sign-in, and a second device.
8. **Secrets:** no production credentials in source code, static HTML, frontend bundles, reports, or Git history.
9. **Verification:** test anonymous access, normal-user vs admin authorization, cross-user isolation with two test accounts, session expiry/logout, persistence after relogin, upload/download controls, build, and deployed HTTP behavior.

## Current status

- Documentation and entry-file inventory for the 50 local AI Studio exports: complete for this pass.
- Secure admin sign-in across all apps: NOT YET VERIFIED.
- Private session/data isolation across all apps: NOT YET VERIFIED.
- Durable user-work/file storage across all apps: NOT YET VERIFIED.
- Runtime/build and white-page/error-free behavior across all apps: NOT YET VERIFIED.
- Source-to-export identity for all 89 source-page rows: NOT YET VERIFIED (master inventory records zero exact identity checks passed at the time it was created).

## Next implementation sequence

1. Use Gifted Eternity as the reference architecture only after verifying its actual source, runtime, auth/session controls, and persistence; do not copy a UI-only login pattern.
2. Locate and verify the exact D Ward Storytime repository/source before using it as a second reference. It was not found by the bounded local folder-name search in this pass.
3. Inventory the real runtime/backend for each app family (static AI Studio exports, Rork apps, Base44 apps, and full-stack Node apps).
4. Reuse one secure identity/storage service only where compatible, with app-specific authorization and tenant boundaries; do not share admin passwords or trust client-side roles.
5. Implement per app or shared service integration, back up before changes, and verify with tests. Do not mark any app secure or persistent based on README text or static markers alone.


## Follow-up verification on 2026-10-15

- Ran `./scripts/verify-all.sh` after the README changes: `portal=healthy shared_static_routes=51 checked=51 failures=0`; `app_containers_running=10 healthy=10 non_healthy=0`; script reported PASS.
- Ran a bounded portfolio-wide source-marker scan over the 242 inventory records / 150 unique local roots. It scanned 2,733 unique source files, found 0 missing roots, and counted marker presence in 55 roots for auth, 24 for admin, 53 for persistence, 38 for file operations, and 39 for API/backend patterns. Full table and JSON evidence are in `security-persistence-static-scan-2026-10-15.md` and `.json`.
- Confirmed the local Story Time model is `/Users/davidyoung/GitHub-Pull/kids`, with a working static page structure (`index.html`, `story-time.html`, `music-funnel.html`, `catalog.html`, CSS and JS). Its current `js/main.js` is only basic page initialization; this is a front-end/opening/navigation reference, not proof of secure account sessions or persistent user files.
- Gifted Eternity public-facing music/store pages are also useful as front-end/navigation references. Their presence does not establish that private admin access, per-user session isolation, or backend persistence is implemented.
- No app login credentials were printed, copied, or changed. No user records, production credentials, or PayPal settings were modified.


## User-selected canonical reference and remediation checkpoint (2026-10-15)
Canonical reference is `https://damoneward38.github.io/gifted_4_eternity/`, repository `https://github.com/damoneward38/gifted_4_eternity`. Read-only clone inspected at `/tmp/gifted_4_eternity-reference` (commit `abf4d9d`): static GitHub Pages music store (`index.html`, `css/style.css`, `css/music.css`, `js/music-data.js`, `js/music-funnel.js`). Its front-end behavior is the reference; security and persistence must be supplied by real server-side services.

Magen-Raki has now been fail-closed and hardened: no default admin session/token, scrypt password-hash verification from deployment environment, expiring random server sessions, authentication gate on `/api`, and admin profile authorization. Backups: `/Users/davidyoung/GitHub-Pull/MAGEN-RAKI-/backups/security-hardening-2026-10-15/`. TypeScript lint/build passed; four isolated negative-auth API checks passed (401/503/401/401). Admin login cannot yet succeed until the owner provisions `MAGEN_ADMIN_PASSWORD_HASH`. SkyGuard and portfolio-wide persistent per-user storage remain unresolved; PayPal untouched.


## Security remediation checkpoint — 2026-10-15 (updated)
- **Magen-Raki:** fail-closed session/admin/API auth changes applied. TypeScript lint and production build pass; 4 negative-auth API smoke checks pass. Admin login is intentionally unavailable until `MAGEN_ADMIN_PASSWORD_HASH` is configured. Backup at `/Users/davidyoung/GitHub-Pull/MAGEN-RAKI-/backups/security-hardening-2026-10-15/`.
- **SkyGuard:** removed default demo identity, simulated login/signup, and browser role escalation; added server-side admin credential verification, expiring sessions, and API auth gate. TypeScript lint and production build pass; 5 API smoke checks pass. Login is intentionally unavailable until `SKYGUARD_ADMIN_EMAIL` and `SKYGUARD_ADMIN_PASSWORD_HASH` are configured. Backup at `/Users/davidyoung/GitHub-Pull/SkyGuard/backups/security-hardening-2026-10-15/`.
- Neither app has yet received multi-user provisioning, durable private per-user files, tenant/ownership enforcement, or real MFA/reset flows. These are still required before claiming the portfolio security/persistence goal is finished. PayPal untouched.
