# Batch 8 — Remediation, Browser Verification, GitHub Branches
Date: 2026-10-15
Branch: `fix/portfolio-batch-08-2026-10-15`

## Apps and commits
- `40-dimension` — `e34dde0` — https://github.com/damoneward38/40-dimension/pull/new/fix/portfolio-batch-08-2026-10-15
- `41-habitat-hub` — `9fbfad5` — https://github.com/damoneward38/41-habitat-hub/pull/new/fix/portfolio-batch-08-2026-10-15
- `42-appforge-ai` — `bb3d60f` — https://github.com/damoneward38/42-appforge-ai/pull/new/fix/portfolio-batch-08-2026-10-15
- `43-vaultx` — `a2f90b5` — https://github.com/damoneward38/43-vaultx/pull/new/fix/portfolio-batch-08-2026-10-15
- `44-untitled` — `258df92` — https://github.com/damoneward38/44-untitled/pull/new/fix/portfolio-batch-08-2026-10-15

## Changes
- DIMENSION: disclose local browser cache; HABITAT HUB: disclose illustrative planning data; APPFORGE AI: clarify that preview/code generation does not deploy a production app.
- VAULTX: replace plaintext PIN plus repeating-key XOR with PBKDF2-SHA-256-derived AES-GCM encryption. PIN is not stored in the new record; legacy weakly-obfuscated vaults migrate to AES-GCM after correct unlock. Added PIN change flow and prevented locked-screen reset from bypassing an existing PIN. Visible notice warns that a four-digit PIN is weak and data is local-only.
- IONOCRAFT: clarify audio does not levitate objects and add high-voltage/ultrasonic build safety warning; repair tab switching (buttons passed labels where numeric tab IDs were expected).
- Added missing favicons and saved pre-edit backups.

## Verification
- Inline JavaScript syntax checks passed for all five apps.
- Browser checks passed for Dimension tabs, Habitat climate switching, AppForge preview/code generation, VaultX encryption at rest/wrong-PIN rejection/unlock/PIN change/legacy migration, and IONOCRAFT tab switching.
- All commits pushed to secondary branches and upstream tracking verified. No merges to `main`; README edits excluded.

## Security limitation
VAULTX uses client-side encryption, but a four-digit PIN has low entropy. Do not use it for high-value credentials; a longer passphrase and independent security review are recommended before production use.
