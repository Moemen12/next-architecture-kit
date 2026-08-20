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
│   ├── ui/                      # Optional React presentation
│   ├── contracts/               # Optional DTOs and runtime schemas
│   ├── domain/                  # Optional business rules
│   ├── application/             # Use cases
│   ├── ports/                   # Optional outbound contracts
│   └── infrastructure/          # Optional concrete external adapters
└── shared/                      # Small reusable primitives
```

Do not create every folder automatically. Start with the smallest structure the feature needs and add a layer only when that responsibility appears. For example, a UI-only feature may contain only `ui/`; a database-backed feature may contain `application/`, `ports/`, and `infrastructure/`.

Next.js code belongs in `app` and `adapters/next`. Domain and application code must not import Next.js, React presentation, databases, or vendor SDKs. Other features use a feature’s public `index` entrypoint instead of private implementation files.

## Add a feature

Create a feature under `src/modules/<feature>` and add only the layers it needs. Keep business rules in `domain`, orchestration in `application`, external contracts in `ports`, concrete implementations in `infrastructure`, and UI in `ui`. Connect infrastructure to the application in `src/adapters/next/composition`.

Use native `fetch` for HTTP unless an adapter has a clear reason to use another client. Keep database, authentication, queues, WebSockets, and vendor libraries behind infrastructure ports.

## Environment

Copy `.env.example` to `.env.local`. Read environment variables through `src/shared/backend/env.ts`; do not access `process.env` throughout the application.
