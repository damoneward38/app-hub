# Tiny / white-label-minimal

A minimal white-label Base44 app (Next.js) with Google login, an apps grid, and a chat editor. Requires Node 22/24/26+, a migrated Postgres DB, Google OAuth and Base44 service-principal env vars.

- Source: `BASE44-APPS/base44-platform-starter/examples/white-label-minimal`
- Run: copy `.env.example` → `.env.local`, fill vars, then `npm run minimal:dev` (http://127.0.0.1:3001)
- This preview page documents the app; it is not statically served because it needs a database and auth runtime.
