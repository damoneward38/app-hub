# NeuroVault Security-Claim Remediation — 2026-10-15

## Scope
Project: `/Users/davidyoung/GitHub-Pull/AISTUDIO-APPS/32-neurovault`

## Change made
- Backed up the original entry page to `backups/security-claims-2026-10-15/index.html`.
- Removed the fabricated rotating “QUANTUM KEY” display. It was generated with `Math.random()` and was not a cryptographic key.
- Replaced the initial display with an explicit statement that no cryptographic key is generated.
- Left the app's existing explicit warnings in place: browser localStorage is not encrypted; zero-knowledge and post-quantum security are not implemented; remote redundancy and cold storage are not connected; integrity is not verified.
- Did not change the app's existing pattern-saving behavior or claim that it is a secure vault.

## Verification
- Inline JavaScript extracted and checked with `node --check`: PASS.
- Local HTTP entry smoke test: PASS (HTTP 200; expected notice present; fake key label absent).
- Changed-file `git diff --check`: PASS.
- The repository-wide whitespace check still reports trailing spaces in the already-modified README; the README was not changed in this remediation.

## Remaining limitations
NeuroVault remains a browser-local demo, not a secure vault or connected neural engine. No authentication, encryption, multi-user ownership, or durable backend was added in this change. No production service was deployed.
