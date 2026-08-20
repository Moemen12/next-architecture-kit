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

The setup command installs both the kit CLI and the standalone template dependencies, then activates the repository pre-commit hook. You only run one command; you do not need to install separately inside `template/`.

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
| `npm run secrets` | Scan staged contents for credentials |

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before adding features. It explains where frontend, backend, domain, application, ports, infrastructure, contracts, adapters, and shared code belong.

## Architecture

```text
src/
├── app/                         # Next.js pages, route handlers, server actions
├── adapters/next/               # Next.js composition and delivery adapters
├── modules/<feature>/
│   ├── ui/                      # Optional feature React presentation
│   ├── contracts/               # Optional DTOs and runtime schemas
│   ├── domain/                  # Optional framework-free business rules
│   ├── application/             # Use cases and orchestration
│   ├── ports/                   # Optional application-owned interfaces
│   └── infrastructure/          # Optional concrete adapters
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

The kit uses Next.js 16, React 19, TypeScript 6, ESLint 9 flat config, Biome formatting, Zod, dependency-cruiser, `eslint-plugin-boundaries`, and Secretlint. The pre-commit hook scans the exact staged contents before allowing a commit; GitHub Actions scans again in CI. Direct dependencies are pinned and installed with `npm ci`. Native `fetch` is the default HTTP mechanism; integrations such as databases, authentication, queues, and WebSockets belong behind infrastructure adapters.

The CLI source is TypeScript. Tool configuration remains in the format officially supported by the tool, so `eslint.config.mjs` and `.dependency-cruiser.mjs` are intentional.

## What is complete versus what remains

| Area | Status | Notes |
|---|---|---|
| Next.js App Router template | Complete | Single-repository template with npm setup and production build |
| Hybrid feature architecture | Complete | Flat feature UI, domain, application, ports, infrastructure, contracts, and shared areas are present |
| Next.js delivery boundaries | Complete | Pages, Route Handlers, Server Actions, and Next composition adapters stay at the edge |
| Dependency direction | Complete | ESLint boundaries and dependency-cruiser enforce the current rules |
| Public feature entrypoints | Complete | Cross-layer access is routed through deliberate `index.ts` APIs |
| TypeScript-first CLI | Complete initial version | `create`, `status`, and safe `upgrade --preview` commands are available |
| One-command setup | Complete | `npm run setup` installs root and template dependencies and activates the hook |
| Runtime validation | Complete | Supported Node runtime guard and full `npm run validate` gate |
| Secret protection | Complete initial version | Secretlint pre-commit scanning plus GitHub Actions scanning |
| Environment boundary | Complete initial version | Typed Zod-based access through the shared backend boundary |
| Concise documentation | Complete initial version | README quick start plus [`CONTRIBUTING.md`](./CONTRIBUTING.md) implementation guide |
| Strict Clean Architecture layout | Remaining | Final strict-mode folder map still needs to be formalized |
| Automatic hybrid-to-clean migration | Remaining | File classification, import rewriting, and migration execution are not enabled yet |
| Reversible migrations | Remaining | Migration history and safe downgrade operations still need implementation |
| Unknown-file classification report | Partial | CLI preview describes the requirement; full manifest-driven reporting remains |
| Optional integrations | Remaining | Database, authentication, queues, WebSockets, and provider adapters need separate integration modules |

The kit is ready for new projects in hybrid mode. The remaining work is the migration product that upgrades an existing generated project into strict mode without losing or silently moving developer code.

## License

MIT
