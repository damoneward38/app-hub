# Shared PayPal + Login Rollout Inventory

- Scan timestamp: 2026-10-15T11:43:37
- Scope: local AI Studio source folders only, excluding dependencies/build outputs; this is static triage, not a security certification.
- Project folders scanned: 50
- Projects with authentication/login markers: 3
- Projects with payment/checkout markers: 2
- Projects with backend/API markers: 6
- Projects with interactive source files: 1

## Per-project triage

| Project | Source files | Auth marker files | Payment marker files | Backend/API marker files | Interactive files | package.json |
|---|---:|---:|---:|---:|---:|---|
| 01-untitled | 3 | 0 | 0 | 0 | 0 | no |
| 02-phone-in-logs | 2 | 0 | 0 | 0 | 0 | no |
| 03-sapphire-openclaw | 3 | 1 | 1 | 1 | 1 | no |
| 04-optimus | 3 | 0 | 0 | 0 | 0 | no |
| 05-orgo | 3 | 0 | 0 | 1 | 0 | no |
| 06-global-hazard-hub | 7 | 0 | 0 | 3 | 0 | no |
| 07-skyguard | 2 | 0 | 0 | 0 | 0 | no |
| 08-zehav-the-golden-vault | 2 | 0 | 0 | 0 | 0 | no |
| 09-magen-raki | 2 | 0 | 0 | 0 | 0 | no |
| 10-baraq | 3 | 0 | 0 | 1 | 0 | no |
| 11-seter-phantom-sovereign | 2 | 1 | 0 | 0 | 0 | no |
| 12-buildmaster | 2 | 0 | 0 | 0 | 0 | no |
| 13-appforge-ai | 2 | 0 | 0 | 0 | 0 | no |
| 14-chazah-data-intelligence-platform | 2 | 0 | 0 | 0 | 0 | no |
| 15-thi-kunhub-repository-fix-scan-utility | 2 | 0 | 0 | 1 | 0 | no |
| 16-app-vault | 2 | 0 | 0 | 0 | 0 | no |
| 17-remix-thi-kunhub-repository-fix-scan-utility | 2 | 0 | 0 | 0 | 0 | no |
| 18-isosync | 3 | 0 | 0 | 0 | 0 | no |
| 19-seedra | 2 | 0 | 0 | 0 | 0 | no |
| 20-prompt-studio-chat-ide | 2 | 0 | 0 | 0 | 0 | no |
| 21-signara | 2 | 0 | 0 | 0 | 0 | no |
| 22-daat-platform | 6 | 0 | 0 | 1 | 0 | no |
| 23-gifted-eternity-ad-maker | 3 | 0 | 0 | 0 | 0 | no |
| 24-keira | 5 | 0 | 0 | 0 | 0 | no |
| 25-et-the-time-dna-platform | 3 | 0 | 0 | 0 | 0 | no |
| 26-quantrade-shomer | 3 | 0 | 0 | 0 | 0 | no |
| 27-neshimat-chayyim | 3 | 0 | 1 | 0 | 0 | no |
| 28-the-anunnaki-bag | 5 | 1 | 0 | 0 | 0 | no |
| 29-neraxis | 5 | 0 | 0 | 0 | 0 | no |
| 30-sonara | 2 | 0 | 0 | 0 | 0 | no |
| 31-axiom | 7 | 0 | 0 | 0 | 0 | no |
| 32-neurovault | 3 | 0 | 0 | 0 | 0 | no |
| 33-lumina-vision | 7 | 0 | 0 | 0 | 0 | no |
| 34-xrealm | 2 | 0 | 0 | 0 | 0 | no |
| 35-anosera | 2 | 0 | 0 | 0 | 0 | no |
| 36-rectra | 2 | 0 | 0 | 0 | 0 | no |
| 37-glaxa | 2 | 0 | 0 | 0 | 0 | no |
| 38-homex-intelligence-hub | 2 | 0 | 0 | 0 | 0 | no |
| 39-bonescan-ai | 3 | 0 | 0 | 0 | 0 | no |
| 40-dimension | 3 | 0 | 0 | 0 | 0 | no |
| 41-habitat-hub | 2 | 0 | 0 | 0 | 0 | no |
| 42-appforge-ai | 2 | 0 | 0 | 0 | 0 | no |
| 43-vaultx | 2 | 0 | 0 | 0 | 0 | no |
| 44-untitled | 3 | 0 | 0 | 0 | 0 | no |
| 45-mockup-studio | 3 | 0 | 0 | 0 | 0 | no |
| 46-shaar-ancient-gates-portal | 3 | 0 | 0 | 0 | 0 | no |
| 47-emet-platform | 2 | 0 | 0 | 0 | 0 | no |
| 48-tzofeh | 2 | 0 | 0 | 0 | 0 | no |
| 49-kol-haemet-resonance-scanner | 3 | 0 | 0 | 0 | 0 | no |
| 50-moach-kvanti | 3 | 0 | 0 | 0 | 0 | no |

## Notes

- Marker counts are a triage aid; they do not prove login or payment flows work.
- Static-export-only projects cannot safely accept PayPal secrets or enforce protected access client-side. They need a server-side API/identity integration.
- The Rork Bot Router hard-coded hosted-button URL has been replaced with server-created subscriptions and a verified webhook path.
- The Rork environment file has no PayPal credential variables. No PayPal environment files were found in the bounded local source scan. No secret values were read or copied. The KHI static page contains a PayPal SDK Client ID, which is a public identifier—not the server-side Client Secret needed for secure subscription creation and webhook verification.
- Gifted Bot Store also contained a mock PayPal subscription URL and an unsigned webhook handler. Its bot checkout source now calls the PayPal Subscriptions API with server-side plan IDs, client-side activation is blocked, and the webhook handler/routes now require PayPal signature verification before processing. Static checks: 7/7 pass. This project cannot yet be build-tested: no package.json or db.ts was found in the local source tree, despite existing imports referencing those modules. A second Content Master payment service still generates a fabricated approval URL and needs its own real checkout integration before it is safe to enable.\n- Rollout to other projects is blocked until a shared backend origin, server-side PayPal REST app Client ID + Client Secret, webhook registration IDs per PayPal app/environment, monthly/yearly plan IDs, and app-specific redirect URLs are configured.
- Do not copy admin passwords between apps. Use a shared identity provider or each app's existing secure identity integration, with server-side authorization and secret-managed credentials.
