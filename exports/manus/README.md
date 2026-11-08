# Manus AI apps

Apps built with Manus AI on this Mac, served together in the App Hub
(`http://127.0.0.1:8780/`).

| App | Source | Served at |
| --- | --- | --- |
| StreamWave | `~/apps/streamwave` | `/preview/manus-streamwave/` |
| AppVault | `~/GitHub-Pull/APP-Vault` | `/preview/other-local-exports-github-pull-app-vault/` |
| Sapphire OpenClaw | `~/apps/sapphire-openclaw`, `~/NeuralCore-Workspace/local/sapphire-openclaw` | `/preview/google-ai-studio-github-pull-aistudio-apps-03-sapphire-openclaw/` (also an AI Studio app) |
| Gifted Eternity Streaming | `~/GitHub-Pull/giftedeternitystreaming` | `/preview/other-local-exports-github-pull-giftedeternitystreaming/` |
| Check — 1check Streaming | `~/GitHub-Pull/Check` | `/preview/other-local-exports-github-pull-check/` |
| Gifted Eternity — Get Paid | `~/GitHub-Pull/get-paid` | `/preview/other-local-exports-github-pull-get-paid/` |

Notes:

- `manus-streamwave` is a relative-path static export (`dist/public`) of the Manus build; its single JS/CSS bundle loads correctly under the gateway.
- `~/apps/appvault-marketplace` is the same app as `~/GitHub-Pull/APP-Vault` (identical title and build), so it is served once.
- These Manus projects include server/API code. The portal serves the client UI; features that call a backend (file uploads, auth, payments, AI endpoints) need the original server running.
