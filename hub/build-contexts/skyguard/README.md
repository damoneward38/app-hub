# 🛡️ מגן‑רקיע (SkyGuard) — Enterprise Sovereign Cybersecurity & Compliance

[![CI/CD Test Pipeline](https://github.com/actions/workflows/status/badges/build.svg?branch=main)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20HIPAA%20%7C%20ISO%2027001%20%7C%20SOC%202-emerald.svg)](https://skyguard.dev)

> **מגן‑רקיע (SkyGuard)** is a high-assurance, multi-tenant enterprise cybersecurity and regulatory compliance platform featuring **78 automated capability modules** organized across **6 Sovereign Cyber Centers**, real-time Merkle audit logging, automated incident response (SOAR), and full white-label multi-tenant isolation.

---

## 📋 Table of Contents
1. [Why Repositories Show "White Pages" & How We Fixed It](#-why-repositories-show-white-pages--how-we-fixed-it)
2. [Project & File Naming Structure](#-project--file-naming-structure)
3. [6 Sovereign Cyber Centers](#-6-sovereign-cyber-centers)
4. [Quick Start & Local Setup](#-quick-start--local-setup)
5. [Automated Testing & CI/CD Pipeline](#-automated-testing--cicd-pipeline)
6. [Server Endpoints & API Architecture](#-server-endpoints--api-architecture)
7. [Deployment Options](#-deployment-options)
8. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 💡 Why Repositories Show "White Pages" & How We Fixed It

When projects are exported from cloud AI environments to GitHub or deployed to **GitHub Pages**, users frequently encounter **blank white screens** for three main reasons:

| Issue | Root Cause | SkyGuard Resolution |
| :--- | :--- | :--- |
| **1. Missing or Misplaced `index.html`** | Web servers (GitHub Pages, Vite, Nginx) require `index.html` directly in the project root with an `<div id="root">` element. | Guaranteed valid `index.html` at the project root with `<div id="root"></div>` and entry point `<script type="module" src="/src/main.tsx">`. |
| **2. Absolute Asset Path 404s** | Default build outputs use absolute root URLs like `<script src="/assets/app.js">`. On GitHub Pages (`https://username.github.io/repo-name/`), this looks for assets on `username.github.io/assets/`, resulting in **404 Not Found** and a blank white screen. | Configured `base: './'` in `vite.config.ts` so all assets are resolved **relatively**, functioning seamlessly on custom domains, sub-directories, and GitHub Pages. |
| **3. Client-Side Subroute 404s** | Direct navigation or page refresh on subroutes (e.g. `/features/1`, `/pricing`, `/app/operations`) returns a 404 on static hosts because no physical `.html` file exists for that path. | Provided `public/404.html` with GitHub Pages SPA routing script and `index.html` URL query decoder to seamlessly redirect back to the client router without page loss. |

---

## 🗂️ Project & File Naming Structure

```text
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD Test & Deployment Pipeline
├── public/
│   └── 404.html               # GitHub Pages SPA fallback & sub-path redirector
├── scripts/
│   └── test-pipeline.ts       # Automated testing pipeline & repository verifier
├── src/
│   ├── components/            # Reusable UI components & layouts (AppLayout, Navbar, etc.)
│   ├── hooks/                 # React Context hooks (useAuth, useWorkspace, useWhiteLabel)
│   ├── pages/                 # 6 Centers & Views
│   │   ├── SecurityCenter.tsx     # 1. Threat Detection & Ingestion
│   │   ├── PrivacyCenter.tsx      # 2. Consent, DSAR & DLP
│   │   ├── ComplianceCenter.tsx   # 3. GDPR, HIPAA, SOC 2, ISO 27001
│   │   ├── IdentityCenter.tsx     # 4. Zero-Trust IAM, MFA & Passkeys
│   │   ├── AutomationCenter.tsx   # 5. SOAR Playbooks & Webhooks
│   │   ├── PlatformCenter.tsx     # 6. Tenants, Billing & Governance
│   │   ├── OperationsConsole.tsx  # Operations: E2E Labs & Benchmarks
│   │   ├── Dashboard.tsx          # Real-time Telemetry & Threat Radar
│   │   └── ...
│   ├── types/                 # Shared TypeScript interfaces & types
│   ├── App.tsx                # Main Router & Sovereign Provider wrappers
│   ├── index.css              # Tailwind CSS imports & global design tokens
│   └── main.tsx               # React DOM entry point
├── index.html                 # Root HTML document & viewport setup
├── metadata.json              # Application capabilities metadata
├── package.json               # Package manifests & scripts
├── server.ts                  # Node/Express API, SSE telemetry & Merkle log backend
├── tsconfig.json              # Strict TypeScript compiler options
└── vite.config.ts             # Vite configuration with relative base path
```

---

## 🏛️ 6 Sovereign Cyber Centers

1. **Security Center (`/app/security`)**: Real-time WAF telemetry, threat intelligence feeds, asset auto-discovery, DDoS mitigation, and firewall rules.
2. **Privacy Center (`/app/privacy`)**: Cookie consent governance, automated DSAR (Right to be Forgotten) pipeline, DLP data classification, and PII anonymization.
3. **Compliance Center (`/app/compliance`)**: Continuous compliance engines covering **GDPR**, **HIPAA**, **ISO 27001**, **SOC 2 Type II**, and **PCI-DSS**.
4. **Identity Center (`/app/identity`)**: Zero-Trust access control, FIDO2 / WebAuthn hardware token enforcement, and role-based access governance.
5. **Automation Center (`/app/automation`)**: SOAR (Security Orchestration, Automation, and Response) playbooks, quarantine automation, and webhook triggers.
6. **Platform Center (`/app/platform`)**: Enterprise tenant management, API ingestion keys, audit logging, and custom white-label branding.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** v20.x or v22.x LTS
- **npm** v10+ (or **pnpm** / **bun**)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/skyguard-cybersecurity.git

# Navigate into the project folder
cd skyguard-cybersecurity

# Install dependencies
npm install
```

### 3. Environment Variables Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Local server port (sandboxed to 3000 in AI Studio) | `3000` |
| `GEMINI_API_KEY` | Optional: Gemini API key for smart threat summaries | `""` |
| `NODE_ENV` | Environment identifier (`development` / `production`) | `development` |

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing & CI/CD Pipeline

SkyGuard includes an automated verification suite in `scripts/test-pipeline.ts` and a GitHub Actions workflow in `.github/workflows/ci-cd.yml`.

### Run the Test Suite Locally
```bash
# Run the complete test pipeline
npm test

# Run TypeScript typecheck and linter
npm run lint

# Test production build bundling
npm run build
```

### What the Pipeline Verifies
1. **`index.html` & Entry Points**: Verifies root file structure, `<div id="root">`, and main script mount.
2. **Asset Path Compatibility**: Validates that `vite.config.ts` uses relative paths (`base: './'`) to prevent white pages.
3. **TypeScript Strict Typechecking**: Ensures 0 compiler errors across both client and server files.
4. **All 6 Cyber Center Views**: Confirms presence of all required dashboard and module components.
5. **Backend Server & REST Endpoints**: Validates Express routes, SSE streams, Merkle audit loggers, and test endpoints.
6. **Production Bundle Verification**: Validates `dist/index.html` and `dist/server.cjs` output.

---

## 🔌 Server Endpoints & API Architecture

The platform runs a unified TypeScript backend via Express with real-time SSE streams:

- `GET /api/health` — Service health check & uptime probe.
- `GET /api/events` — Real-time cybersecurity telemetry events.
- `GET /api/telemetry/stream` — SSE Server-Sent Events stream for live threat radar.
- `GET /api/audit` — Tamper-evident Merkle tree audit log with SHA-256 verification.
- `POST /api/e2e/simulate` — End-to-end multi-center threat response simulation.
- `POST /api/performance/load-test` — High-throughput tenant benchmark profiler.
- `GET /api/security/audit-scan` — Automated 5-point RBAC and compliance audit scanner.
- `GET /api/monitoring/status` — Platform availability, latency, and SLA monitors.

---

## 📦 Deployment Options

### Option A: GitHub Pages (Client SPA Mode)
1. Push this repository to GitHub.
2. In your GitHub repository settings, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The `.github/workflows/ci-cd.yml` workflow will automatically test, build, and deploy your site with 0 configuration!

### Option B: Node.js / Custom Server / Cloud Run
```bash
# Build the production bundle
npm run build

# Start the bundled server
npm start
```

### Option C: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ❓ Troubleshooting & FAQ

#### Q: Why do I see a blank white page when I open the repository on GitHub Pages?
**A:** This is caused by missing asset paths. Ensure `base: './'` is present in `vite.config.ts` (included by default in this repository) and that the GitHub Actions build workflow deploys the generated `dist/` directory.

#### Q: How do I test subroute links without getting a 404 on static hosts?
**A:** The repository includes `public/404.html` which redirects all deep subpaths (like `/features/1` or `/app/operations`) back through `index.html` and decodes the route cleanly.

---

## 📄 License
© 2026 **מגן‑רקיע (SkyGuard)**. All rights reserved. Enterprise sovereign cybersecurity platform.
