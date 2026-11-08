# Critical Authentication Findings — 2026-10-15

Scope: targeted code review after the portfolio-wide static scan. No source code was changed by this review. Findings below require remediation before these apps can be described as secure.

## Critical: MAGEN-RAKI

Files reviewed:
- `/Users/davidyoung/GitHub-Pull/MAGEN-RAKI-/src/context/AuthContext.tsx`
- `/Users/davidyoung/GitHub-Pull/MAGEN-RAKI-/server.ts`

Observed:
- The client initializes a default SUPERADMIN user for the known admin email when no cached user exists.
- The client initializes a hard-coded session token when no token is present.
- If the server session check fails, the client keeps cached state instead of failing closed.
- The login request sends email and role but does not send/verify a password.
- The server's `GET /api/auth/session` returns an authenticated root-admin identity and hard-coded token when no valid token is supplied.
- The server's `POST /api/auth/login` accepts an email without validating a password and grants SUPERADMIN based on matching the email string.
- `GET /api/admin/current` returns the root-admin profile without checking a session.
- Sensitive-looking `/api/six686/...` routes require a separate review for server-side authentication/authorization.

Impact: a caller may be able to claim the administrator identity without proving account ownership. This is a real code-level authentication bypass, not merely a missing marker.

Required remediation: remove default admin identity/token, fail closed on missing/invalid sessions, verify credentials using a trusted identity provider or server-side password-hash verification, derive roles only from trusted server-side records, and require authentication/authorization on every protected route. Add negative tests for no token, invalid token, non-admin caller, and cross-user access. Back up before modifying this app.

## Critical: SkyGuard

File reviewed:
- `/Users/davidyoung/GitHub-Pull/SkyGuard/src/features/auth/AuthContext.tsx`

Observed:
- The client creates a default demo owner identity if local storage is empty.
- It restores the user profile from browser local storage.
- Login waits briefly and constructs a user locally; the supplied role is used in that client-side profile rather than verified by a server.
- Session entries contain pre-filled demo device/IP/location details and are not proof of actual server-managed sessions.

Impact: this is a simulated frontend authentication experience, not secure sign-in or session isolation. Local storage is editable by the browser user and must never be trusted to grant owner/admin access.

Required remediation: connect to a real server-side identity/session provider, remove demo-user defaults from production builds, derive roles from server-side records, and enforce authorization on backend routes. Store actual session state and user-owned data in a durable backend with ownership checks.

## Secure reference pattern found

The Base44 platform starter includes a server-side Auth.js configuration, a database-derived role, an authenticated `/api/me` route, hand-enforced per-user ownership predicates, and auth/RLS smoke-test scripts. This is a useful implementation pattern, but it is a separate starter project and is not evidence that these protections are deployed in the apps above. Its smoke scripts write to the configured database and must only run against an explicitly confirmed scratch database; they were not run during this audit.

## Portfolio-wide limitation

The 242-record inventory maps to 150 unique local roots. A marker scan found auth/admin/persistence/API-related strings in some roots, but only source review plus negative tests can prove the controls. Do not reuse admin passwords across apps or rely on local storage, hidden buttons, email-string matching, or client-supplied roles. Static-only apps require a trusted backend before private accounts, sessions, or user files can be protected.

## Status

- MAGEN-RAKI: CRITICAL — remediation required; not marked fixed.
- SkyGuard: CRITICAL — simulated client-side auth; remediation required; not marked fixed.
- No credentials were exposed or changed. No production data was modified.


## Remediation update (2026-10-15)

### Magen-Raki changes applied
- Removed the default root-admin session/token fallback. `/api/auth/session` now returns `401` unless a live server-owned session token is supplied.
- Login now accepts only the configured administrator email and verifies the password against `MAGEN_ADMIN_PASSWORD_HASH` using scrypt plus constant-time comparison. If that secret is not configured, login fails closed with `503`; no password or secret was created or stored by this change.
- Added random session tokens, an 8-hour server-side session expiry, logout invalidation, and server-side authentication middleware across `/api` routes. `/api/admin/current` requires an authenticated SUPERADMIN.
- Removed instant admin login, simulated secondary-role buttons, fake SSO buttons, prefilled fake password, and client-selectable role from the sign-in UI.
- Added `PORT` environment override to permit isolated local smoke tests.
- Backups before edits: `/Users/davidyoung/GitHub-Pull/MAGEN-RAKI-/backups/security-hardening-2026-10-15/`.

### Verification
- `npm run lint`: PASS.
- `npm run build`: PASS (existing large-bundle advisory remains).
- Isolated API smoke checks: no-token session `401`; login with no configured credential hash `503`; admin profile without token `401`; sensitive `/api/six686/status` without token `401`. All four matched expected fail-closed behavior.
- Real admin login has **not** been verified because no `MAGEN_ADMIN_PASSWORD_HASH` is configured. Secure admin sign-in remains unavailable until the owner provisions a password hash in the deployment environment.

### Correct reference app
- User specified the exact working music-store reference: `https://damoneward38.github.io/gifted_4_eternity/` (repository `https://github.com/damoneward38/gifted_4_eternity`).
- Inspected a read-only clone at `/tmp/gifted_4_eternity-reference` (commit `abf4d9d`). It is a static GitHub Pages site with `index.html`, `css/style.css`, `css/music.css`, `js/music-data.js`, and `js/music-funnel.js`; no package manifest or backend was present in the repository root. Use its existing layout/navigation and user-facing music-store flow as the visual/interaction reference. It does **not** supply authentication, private per-user sessions, or backend persistence.

### Still unresolved / not falsely marked complete
- SkyGuard's browser-side demo user, simulated login/signup, localStorage identity, client-side role switching, fake session list, and fake MFA/reset methods remain a critical finding and have not yet been remediated.
- No portfolio-wide server-side user accounts, admin authorization, cross-user ownership enforcement, or durable private file storage has been deployed or verified. Static text markers are not proof of security.
- PayPal untouched.


### SkyGuard changes applied
- Removed the default demo owner identity and browser-local identity restoration.
- Login now calls `/api/auth/login`; session restoration calls `/api/auth/session`; logout invalidates the server-side token. The token is held in `sessionStorage`, not persisted as a trusted user profile.
- Removed client-selected role escalation; roles and identity come from the server response. Simulated signup, MFA toggles, email verification, password reset, and session-management actions now fail closed/no-op rather than reporting fake success.
- Added a server-owned random 8-hour session token, scrypt password-hash verification via `SKYGUARD_ADMIN_PASSWORD_HASH`, configured admin email via `SKYGUARD_ADMIN_EMAIL`, and a fail-closed API gate for all API routes except health, authentication, and quickstart docs.
- Backups: `/Users/davidyoung/GitHub-Pull/SkyGuard/backups/security-hardening-2026-10-15/`.
- `npm run lint`: PASS; `npm run build`: PASS (existing large-bundle advisory remains).
- Isolated API smoke checks: health `200`; no-token session `401`; login without configured admin secrets `503`; events without token `401`; mutation without token `401`. All five matched expected status codes.
- SkyGuard login remains unavailable until `SKYGUARD_ADMIN_EMAIL` and `SKYGUARD_ADMIN_PASSWORD_HASH` are provisioned. Multi-user registration, durable storage, per-user ownership, and real MFA/password reset are not implemented by this patch.
