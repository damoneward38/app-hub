# Batch 3 — Remediation, Browser Verification, GitHub Branches
Date: 2026-10-15
Reference UI: https://damoneward38.github.io/gifted_4_eternity/
Branch: `fix/portfolio-batch-03-2026-10-15`

## Apps and commits
- `15-thi-kunhub-repository-fix-scan-utility` — `f641403` — https://github.com/damoneward38/15-thi-kunhub-repository-fix-scan-utility/pull/new/fix/portfolio-batch-03-2026-10-15
- `16-app-vault` — `9cbc593` — https://github.com/damoneward38/16-app-vault/pull/new/fix/portfolio-batch-03-2026-10-15
- `17-remix-thi-kunhub-repository-fix-scan-utility` — `4f7a0ef` — https://github.com/damoneward38/17-remix-thi-kunhub-repository-fix-scan-utility/pull/new/fix/portfolio-batch-03-2026-10-15
- `18-isosync` — `f07b4c3` — https://github.com/damoneward38/18-isosync/pull/new/fix/portfolio-batch-03-2026-10-15
- `19-seedra` — `7835d10` — https://github.com/damoneward38/19-seedra/pull/new/fix/portfolio-batch-03-2026-10-15

## Changes
- THI KUNHUB and REPO SCAN: prominently disclose that static exports do not read local files; label generated findings/status as demo examples instead of implying real scans.
- IsoSync: remove unsupported claims of hashing, durable vault storage, and global research upload; mark records session-only; escape user-provided content before rendering to prevent HTML injection.
- SEEDRA: preserve each seed's original index while sorting active/harvested rows, preventing action buttons from mutating a different record after sorting.
- Added no-network favicons where missing. Backups saved before edits under each app's `backups/` directory.
- APP VAULT: Add App dialog opens and cancels correctly; storage remains browser-local, not shared backend storage.

## Verification
- Inline JavaScript syntax checks passed for all five apps.
- Browser smoke and targeted interaction tests passed 5/5. Initial REPO SCAN run found missing favicon; favicon was added and final run passed.
- All five commits pushed to the named secondary branch and upstream tracking verified. No branch was merged into `main`.
- README edits remain uncommitted/untouched; no unrelated README changes were included in the batch commits.

## Limitations
- THI KUNHUB / REPO SCAN remain demos; a real scanner needs an explicit user-selected file input or trusted backend integration.
- IsoSync has no durable storage or analytics backend in this static export.
- APP VAULT and SEEDRA use browser localStorage, which is device/browser-local and is not a secure multi-user backend.
