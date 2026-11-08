# Batch 6 — Remediation, Browser Verification, GitHub Branches
Date: 2026-10-15
Branch: `fix/portfolio-batch-06-2026-10-15`

## Apps and commits
- `30-sonara` — `e29447f` — https://github.com/damoneward38/30-sonara/pull/new/fix/portfolio-batch-06-2026-10-15
- `31-axiom` — `e1f8500` — https://github.com/damoneward38/31-axiom/pull/new/fix/portfolio-batch-06-2026-10-15
- `32-neurovault` — `b6d16f2` — https://github.com/damoneward38/32-neurovault/pull/new/fix/portfolio-batch-06-2026-10-15
- `33-lumina-vision` — `cd383c9` — https://github.com/damoneward38/33-lumina-vision/pull/new/fix/portfolio-batch-06-2026-10-15
- `34-xrealm` — `2ec10ff` — https://github.com/damoneward38/34-xrealm/pull/new/fix/portfolio-batch-06-2026-10-15

## Changes
- SONARA: clarify mic permission is opt-in and audio visualization is not diagnostic.
- AXIOM: label particle canvas as a toy simulation.
- NEUROVAULT: remove false AES-512/secure vault/quantum hardware claims; state that patterns are ordinary browser localStorage and not encrypted; escape user-provided pattern names to prevent HTML injection.
- LUMINA VISION: warn that API key and prompts go directly from the browser to OpenAI; live API failures now surface errors rather than silently returning a simulated answer.
- X-REALM: label zones as interactive fiction, add missing `telSub` ID so zone changes update the visible status without a null-reference error.
- Added missing favicons and saved pre-edit backups.

## Verification
- Inline JS syntax checks passed for all five apps.
- Final browser interaction tests passed 5/5 across audio start/stop, AXIOM controls, NeuroVault save and escaping, Lumina local demo plus intercepted API-failure path, and X-REALM zone navigation.
- All commits pushed to secondary branch and upstream tracking verified. No merges to `main`; README edits preserved outside commits.
