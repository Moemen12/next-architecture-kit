# Next.js Architecture Kit Template

A single-repository Next.js App Router project using the hybrid architecture from Next Architecture Kit.

## Start

Use Node 22 LTS, Node 24 LTS, or Node 26+.

```bash
npm ci
npm run dev
```

## Validate

```bash
npm run validate
```

Validation runs the runtime guard, Biome, ESLint, TypeScript, dependency-graph rules, Secretlint, and the production build. After `npm ci`, the pre-commit hook scans staged contents automatically.

## Structure

```text
src/
├── app/                         # Next.js pages, Route Handlers, Server Actions
├── adapters/next/               # Next-specific composition and delivery adapters
├── modules/<feature>/
│   ├── frontend/                # React presentation
│   ├── contracts/               # DTOs and runtime schemas
│   └── backend/
│       ├── domain/              # Framework-free business rules
│       ├── application/         # Use cases
│       ├── ports/               # Application-owned interfaces
│       └── infrastructure/      # Concrete external adapters
└── shared/                      # Small reusable primitives
```

Next.js code belongs in `app` and `adapters/next`. Domain and application code must not import Next.js, React presentation, databases, or vendor SDKs. Other features use a feature’s public `index` entrypoint instead of private implementation files.

## Add a feature

Create a feature under `src/modules/<feature>` and add only the layers it needs. Keep business rules in `backend/domain`, orchestration in `backend/application`, external contracts in `backend/ports`, and concrete implementations in `backend/infrastructure`. Connect infrastructure to the application in `src/adapters/next/composition`.

Use native `fetch` for HTTP unless an adapter has a clear reason to use another client. Keep database, authentication, queues, WebSockets, and vendor libraries behind infrastructure ports.

## Environment

Copy `.env.example` to `.env.local`. Read environment variables through `src/shared/backend/env.ts`; do not access `process.env` throughout the application.
