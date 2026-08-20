# Next Architecture Kit

An npm-based, TypeScript-first starter for new Next.js App Router projects. It combines feature organization with practical Clean Architecture boundaries and is designed to become stricter without rewriting business logic.

## Quick start

Requirements: Node 22 LTS, Node 24 LTS, or Node 26+. Node 25 is not supported by the dependency-validation toolchain.

```bash
git clone https://github.com/Moemen12/next-architecture-kit.git
cd next-architecture-kit
npm run setup
npm run validate
npm run dev
```

The setup command installs both the kit CLI and the standalone template dependencies. You only run one command; you do not need to install separately inside `template/`.

To start a new project from the template, copy `template/` into a new repository and run `npm ci`. The generated project is intentionally a normal single Next.js repository and does not depend on this kit at runtime.

## Commands

| Command | Purpose |
|---|---|
| `npm run validate` | Format, lint, typecheck, enforce architecture, and build |
| `npm run dev` | Start the template development server |
| `npm run build` | Build the template for production |
| `npm run kit:status` | Report governed project files |
| `npm run kit:preview` | Preview the future strict-mode migration |
| `npm run kit:create -- <name>` | Create a new project from the template |

## Architecture

```text
src/
├── app/                         # Next.js pages, route handlers, server actions
├── adapters/next/               # Next.js composition and delivery adapters
├── modules/<feature>/
│   ├── frontend/                # Feature React presentation
│   ├── contracts/               # DTOs and runtime schemas
│   └── backend/
│       ├── domain/              # Framework-free business rules
│       ├── application/         # Use cases and orchestration
│       ├── ports/               # Application-owned interfaces
│       └── infrastructure/      # Database, API, queue, and vendor adapters
├── shared/
│   ├── kernel/                  # Small stable primitives
│   ├── frontend/                # Reusable React primitives
│   └── backend/                 # Reusable server-neutral utilities
└── contracts/                   # Application-wide contracts when required
```

The dependency direction is inward:

```text
Next delivery → composition → application → domain
                              ↓
                             ports ← infrastructure
```

Domain and application code must not import Next.js, React presentation, database clients, or vendor SDKs. Features expose public `index` files; private implementation paths are not valid cross-feature APIs.

## Tooling policy

The kit uses Next.js 16, React 19, TypeScript 6, ESLint 9 flat config, Biome formatting, Zod, dependency-cruiser, and `eslint-plugin-boundaries`. Direct dependencies are pinned and installed with `npm ci`. Native `fetch` is the default HTTP mechanism; integrations such as databases, authentication, queues, and WebSockets belong behind infrastructure adapters.

The CLI source is TypeScript. Tool configuration remains in the format officially supported by the tool, so `eslint.config.mjs` and `.dependency-cruiser.mjs` are intentional.

## Roadmap

The current kit provides the complete hybrid structure, boundary enforcement, a safe CLI status/preview surface, and the migration manifest foundation. The next strict-mode milestone will add a generated manifest, classified-file migration, import rewriting, unknown-file reporting, and reversible upgrade/downgrade operations.

## License

MIT
