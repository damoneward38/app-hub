# תכנית הצופה — Taḥnīʿ Hâzoo

> A Go-High-Level-style **business blueprint planner** with a **200-agent cybersecurity swarm orchestrator**.

Taḥnīʿ Hâzoo is a React + TypeScript dashboard for planning, valuing, and securing a business: build a blueprint, explore the vision pillars, run valuations, and orchestrate a simulated cyber-defense swarm from one console.

## Features

- **Blueprint wizard** — step-by-step business plan builder (`WizardView`, `WizardView` flow)
- **Dashboard & home** — live overview of the operation (`HomeView`, `DashboardView`)
- **Pillars vault** — the core strategic pillars of the business (`PillarsVaultView`)
- **Valuation & investor terminal** — financial modeling and investor-facing views (`ValuationView`, `InvestorTerminalView`)
- **Cybersecurity swarm** — 200-agent swarm visualization and control (`VisualArchitectureView`, `SecureEnterpriseView`)
- **Cores registry** — registered capabilities / "cores" (`CoresRegistryView`)
- **Creator studio** — content and asset generation (`CreatorStudioView`)
- **NeuralCore bridge** — local assistant console and chat (`NeuralCoreChatView`, `NeuralCoreConsoleView`)
- **Audit ledger** — append-only activity/audit trail (`AuditLedgerView`)
- **Docs library** — built-in documentation (`DocsLibraryView`, `DocsView`)
- **Integrations** — Sela diagnostics, Ezhkar sandbox, Ollama config, live chat (`SelaDiagnosticsView`, `EzhkarSandboxView`, `OllamaConfigModal`, `LiveChatDrawer`)
- **Command palette** — keyboard-first navigation (`CommandPaletteModal`)
- **Admin & auth** — gated admin console and login (`AdminView`, `AuthModal`)

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (dev server + build)
- **Tailwind CSS 4**
- **Motion** (animations), **lucide-react** (icons)
- **Google GenAI** (`@google/genai`) for Gemini-powered features
- **Express** for the optional local server

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) A Gemini API key for AI-powered features

### Install

```bash
npm install
```

### Configure

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key for AI calls |
| `APP_URL` | Public URL of the hosted app (self-referential links / OAuth callbacks) |

### Run (development)

```bash
npm run dev
```

The app starts at **http://localhost:3001**.

### Build & preview

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build
```

### Type check

```bash
npm run lint      # tsc --noEmit
```

## Project Structure

```
.
├── index.html            # HTML entry point
├── src/
│   ├── main.tsx          # React bootstrap
│   ├── App.tsx           # Root component & routing
│   ├── components/       # Views (dashboard, wizard, swarm, console, …)
│   ├── services/         # Data, store, integration + NeuralCore bridges
│   ├── types/            # Shared TypeScript types
│   └── index.css         # Global styles (Tailwind)
├── metadata.json         # App metadata / declared capabilities
├── vite.config.ts        # Vite configuration
└── package.json
```

## License

See the repository for license details.
