# Next Architecture Kit

## Purpose

Next Architecture Kit is an opinionated starter architecture for new Next.js App Router applications. It combines feature-oriented development with a restrained form of Clean Architecture. The initial mode is deliberately practical: it keeps related code together, minimizes ceremony, and enforces dependency direction from the beginning. A later strict mode can move the same code toward stronger Clean Architecture boundaries without requiring a conceptual rewrite.

The kit is designed for a single Next.js application repository. Next.js is a delivery mechanism, not the owner of the business rules. The architecture therefore keeps framework-specific code at the outer edge and makes meaningful backend modules and reusable frontend code portable.

## The governing dependency rule

> Dependencies point inward toward stable policy. Frameworks, transport protocols, databases, vendors, and UI delivery mechanisms are details at the edge.

The allowed direction is:

```text
Next.js delivery -> frontend composition -> feature application/domain
Next.js delivery -> backend transport -> feature application/domain
feature infrastructure adapters -> feature ports/contracts
shared technical adapters -> shared contracts
```

The forbidden direction is:

```text
domain/application -> next/*
domain/application -> react-server or browser APIs
domain/application -> ORM/database/vendor SDK
backend -> frontend UI
frontend -> backend infrastructure implementation
feature A internals -> feature B internals
```

A dependency rule is enforced by imports, not by folder names. A file in a folder named `domain` that imports `next/headers` is still invalid.

## Hybrid mode: the default layout

```text
.
├── src/
│   ├── app/                         # Next.js App Router delivery only
│   │   ├── (routes)/                # page/layout/loading/error compositions
│   │   ├── api/                     # Route Handlers; HTTP translation only
│   │   └── providers.tsx            # Next/React composition boundary
│   │
│   ├── modules/                    # Business capabilities, organized by feature
│   │   └── <feature>/
│   │       ├── frontend/            # React-oriented feature presentation
│   │       │   ├── components/      # Framework-neutral React where possible
│   │       │   ├── hooks/           # Client-side UI behavior
│   │       │   └── view-models/     # Presentation mapping, no Next imports
│   │       ├── backend/             # Server-side feature policy and adapters
│   │       │   ├── domain/          # Entities, value objects, domain rules
│   │       │   ├── application/     # Use cases and orchestration
│   │       │   ├── ports/           # Inbound use-case and outbound contracts
│   │       │   └── infrastructure/ # Concrete DB/provider/transport adapters
│   │       └── contracts/           # Explicit frontend/backend DTOs and schemas
│   │
│   ├── shared/                     # Small, stable, genuinely cross-feature code
│   │   ├── kernel/                 # Result, errors, IDs, dates, pure primitives
│   │   ├── frontend/               # Reusable React-only UI primitives
│   │   └── backend/                # Server-neutral backend utilities/contracts
│   │
│   └── adapters/                   # Framework and vendor composition adapters
│       └── next/                   # Next-specific wrappers and runtime bridges
│
├── tests/
│   ├── architecture/               # Dependency-boundary tests
│   └── support/                    # Test-only builders and helpers
├── scripts/                        # Repository maintenance and migration commands
├── .github/workflows/              # CI policy
└── config/                         # Tool configuration, not application policy
```

The exact feature name is illustrative. The kit should generate a minimal example feature only when it helps demonstrate the boundaries; it should not force users to keep example business code.

## What belongs where

| Area | Responsibility | May import | Must not import |
|---|---|---|---|
| `src/app` | Next route/page entrypoints and composition | UI public APIs, application entrypoints, Next.js | feature internals, database clients, domain internals |
| `modules/*/ui` | Optional React presentation and client interaction | feature contracts, shared frontend, browser-safe application facades | Next server APIs, infrastructure |
| `modules/*/domain` | Optional business rules and domain models | shared kernel | Next.js, React, HTTP, database/vendor SDKs |
| `modules/*/application` | Use-case orchestration | domain, ports, shared backend/kernel | Next.js, React, HTTP, concrete infrastructure |
| `modules/*/ports` | Optional stable outbound contracts | domain types, shared kernel | frameworks and concrete providers |
| `modules/*/infrastructure` | Optional concrete implementations | ports, vendors, database drivers | UI code and unrelated feature internals |
| `modules/*/contracts` | Boundary DTOs and validation schemas | shared kernel, schema library | Next request/response types, infrastructure |
| `adapters/next` | Next.js-specific bridges | Next.js and stable application APIs | domain implementation details |
| `shared` | Small cross-feature primitives | standard library and approved neutral libraries | feature internals, Next.js unless explicitly in an adapter |

## Public APIs between features

A feature is not a namespace that permits unrestricted imports. Each feature exposes a deliberate public entrypoint, for example:

```text
src/modules/accounts/ui/index.ts
src/modules/accounts/application/index.ts
src/modules/accounts/ports/index.ts
src/modules/accounts/contracts/index.ts
```

Consumers may import only from these public entrypoints. They may not import another feature's `domain`, `application`, `ports`, or `infrastructure` directories directly. This allows a feature to become a package or an adapter later without changing all consumers.

Within the same feature, the default hybrid mode permits direct imports across the feature's internal folders only in the inward direction. The strict upgrade mode narrows this further to explicit ports and public APIs.

## Inbound and outbound boundaries without dependency injection

The initial mode uses explicit functions and factory modules rather than a dependency-injection container. An inbound port is a use-case-facing function or interface invoked by a delivery adapter. An outbound port is an interface owned by the application/domain side and implemented by infrastructure.

A simple composition root wires concrete implementations in one place:

```text
src/adapters/next/composition/
src/modules/<feature>/infrastructure/composition.ts
```

This keeps dependency injection out of ordinary feature code while preserving the essential direction of the dependency inversion principle. Strict mode may later introduce explicit factories or dependency injection only where the system proves it is useful.

## Next.js boundaries

Next.js files remain in `src/app` and `src/adapters/next`. Route Handlers translate HTTP input into an inbound application call and translate the result back to HTTP. Server Actions perform the same role for server-invoked mutations. They must not contain domain rules or direct ORM calls.

React components that do not need Next.js should not import `next/link`, `next/image`, `next/navigation`, server-only modules, or request APIs. When a component does need those capabilities, the dependency must be visible at the Next adapter/composition edge rather than hidden inside a supposedly portable feature component.

### Mandatory server-only doors

The kit treats the following locations as server-only doors. The public barrel or delivery entrypoint at each door begins with `import "server-only";`; internal implementation files do not need to repeat the marker when the import rules force consumers through that barrel:

| Location | Why it is server-only |
|---|---|
| `src/app/api/**` | Route Handlers receive and translate HTTP requests. |
| `src/app/actions.ts` and future Server Action entrypoints | Server Actions execute on the server and call backend composition. |
| `src/adapters/next/index.ts` and `src/adapters/next/**/index.ts` | Next-specific runtime bridges and composition roots wire server implementations. |
| `src/modules/**/infrastructure/index.ts` | Concrete database, filesystem, queue, WebSocket, authentication, and vendor adapters belong outside portable policy. |
| `src/shared/backend/index.ts` | Shared backend utilities may access server-only capabilities such as environment variables. |

The public barrel is the only supported import surface for these backend areas. ESLint rejects consumers that import an infrastructure, Next adapter, or shared-backend implementation file directly. It also rejects UI code from importing backend areas at all. Therefore, a composition leaf such as `src/adapters/next/composition/example.ts` is intentionally unmarked: it is an internal implementation exported through `src/adapters/next/index.ts`, and the boundary rule prevents bypassing that door.

The `server-only` check scans `src` and derives these public doors automatically; developers do not need to remember which individual files require the marker. New backend integrations should be exported deliberately from a protected barrel, or the kit’s boundary policy must be updated before adding a new server-specific area. Ordinary `src/app` pages and layouts are not blanket-marked because a server-rendered React component is not automatically a server-only implementation: it may render portable UI and can remain a delivery entrypoint. Any sensitive or runtime-specific logic imported by those pages must still come through a marked door.

## Strict mode target

The strict mode is not a second unrelated architecture. It is a more explicit representation of the same boundaries:

```text
src/
├── delivery/next/                  # pages, route handlers, server actions
├── modules/<feature>/
│   ├── domain/
│   ├── application/
│   │   ├── inbound/
│   │   └── outbound/
│   ├── adapters/
│   └── infrastructure/
├── frontend/
│   ├── features/<feature>/
│   └── shared/
└── shared/kernel/
```

The migration is safe because the hybrid layout already has the semantic distinctions. The CLI changes locations and rules, updates imports, writes a migration manifest, and reports files it cannot classify with confidence. Unknown files are never silently deleted or forced into a layer.

## Non-negotiable architectural policies

The generated project uses one canonical convention. Users may add features, but they do not choose alternative boundary systems. Architectural exceptions must be explicit, named, documented, and narrowly scoped. A blanket ESLint disable for an entire directory is prohibited.

The validator must fail when application/domain code imports Next.js, React client-only APIs, a concrete database/provider package, or another feature's private files. It must also detect circular dependencies, orphaned files in governed areas, and imports that bypass a feature's public entrypoint.

The architecture is successful when a feature can be extracted by replacing its outer adapters and composition wiring, not by rewriting its business rules.

## Versioning principle

The template pins a tested dependency baseline and commits a lockfile. New dependency versions are introduced through deliberate kit releases and CI verification. Generated projects can update normally, but the kit never uses an unbounded `latest` range for every dependency and never silently rewrites a user's project.

## License

The repository should use a permissive license suitable for reuse. MIT is the default recommendation unless the owner chooses otherwise before publication.
