# Developer Guide

This guide explains where code belongs in a project generated from Next Architecture Kit. The main rule is simple:

> Put framework and vendor details at the edge. Keep business policy in the center.

## Request flow

A request should move through the system in this direction:

```text
Next.js page / Route Handler / Server Action
                 ↓
      Next.js composition adapter
                 ↓
          application use case
                 ↓
            domain policy
                 ↓
       application-owned port
                 ↓
      infrastructure implementation
```

The flow may stop before infrastructure when a use case does not need external state. The inner code must not import the outer code.

## Where each kind of code belongs

| Code | Location | Responsibility | Must not depend on |
|---|---|---|---|
| Pages, layouts, loading, errors | `src/app/**` | Next.js delivery and composition of UI | Database clients and business rules directly |
| Route Handlers | `src/app/api/**/route.ts` | Translate HTTP input/output | ORM, vendor SDKs, private feature files |
| Server Actions | `src/app/actions.ts` or a feature delivery file | Translate form/action input | Infrastructure details directly |
| Next.js composition | `src/adapters/next/composition/**` | Wire concrete adapters to use cases | UI implementation |
| React feature components | `src/modules/<feature>/ui/**` | Feature presentation | Next.js server APIs unless explicitly required |
| Domain entities and policies | `src/modules/<feature>/domain/**` | Business invariants and decisions | Next.js, React, HTTP, databases, vendors |
| Use cases | `src/modules/<feature>/application/**` | Orchestrate business operations | Next.js, concrete database/API clients |
| Outbound ports | `src/modules/<feature>/ports/**` | Interfaces required by application policy | Concrete infrastructure libraries |
| Infrastructure adapters | `src/modules/<feature>/infrastructure/**` | Implement ports using databases or vendors | Presentation code |
| Runtime schemas and DTOs | `src/modules/<feature>/contracts/**` | Validate and describe feature boundaries | Next.js delivery details |
| Shared kernel | `src/shared/kernel/**` | Small stable primitives used widely | Feature-specific code |
| Shared backend | `src/shared/backend/**` | Server-neutral technical helpers | Next.js delivery and feature internals |
| Shared frontend | `src/shared/frontend/**` | Reusable React primitives | Backend and infrastructure code |
| Tests | `tests/**` or colocated test files | Verify behavior and boundaries | Production-only assumptions |

## Adding a feature

Create a directory under `src/modules`:

```text
src/modules/invoices/
├── ui/
│   ├── components/
│   └── index.ts
├── contracts/
│   ├── invoice-contract.ts
│   └── index.ts
├── domain/
├── application/
│   ├── create-invoice.ts
│   └── index.ts
├── ports/
│   ├── invoice-repository.ts
│   └── index.ts
└── infrastructure/
    ├── in-memory-invoice-repository.ts
    └── index.ts
```

Start with only the layers the feature needs. Add `domain` when there is a business rule, `application` when there is an operation, `ports` when a use case needs an external capability, and `infrastructure` only when a concrete implementation exists. Add `ui` only when the feature has presentation code.

Expose deliberate public APIs from `index.ts` files. Consumers should import from a feature boundary, for example:

```ts
import { createInvoice } from "@/modules/invoices/application";
```

Do not import private implementation paths from another feature.

## Adding an HTTP endpoint

Keep the Route Handler thin. Parse transport input, call a public application entrypoint or Next composition function, and translate the result into an HTTP response.

```ts
// src/app/api/invoices/route.ts
import { createInvoice } from "@/adapters/next/composition/invoices";

export async function POST(request: Request) {
  const input = await request.json();
  const result = await createInvoice(input);
  return Response.json(result, { status: 201 });
}
```

Do not put validation rules, repository calls, or business decisions directly in the Route Handler.

## Adding a database or external service

Define the required capability as a port owned by the application layer:

```ts
// src/modules/invoices/ports/invoice-repository.ts
export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
}
```

Implement it in infrastructure:

```text
src/modules/invoices/infrastructure/postgres-invoice-repository.ts
```

The implementation may import a database driver or ORM. The port and use case must not. Wire the implementation in:

```text
src/adapters/next/composition/invoices.ts
```

The application should depend on the interface, using a factory or explicit function argument. A dependency-injection container is not required in hybrid mode.

## Frontend portability

A component belongs in `modules/<feature>/ui` when it is specific to that feature. A component belongs in `shared/frontend` only when it is genuinely reusable across features. Keep React components free of Next.js imports when portability matters. Components that require `next/link`, server actions, or server-only data access are delivery-specific and should stay near `src/app` or an explicit Next adapter.

Do not create abstractions only to make a hypothetical future extraction possible. Extract a boundary when the component or capability has a real second consumer.

## Environment and security

Read environment variables through `src/shared/backend/env.ts`. Do not access `process.env` throughout the application. Never commit `.env.local`, credentials, private keys, or real tokens.

`npm run setup` activates the local pre-commit hook. Secretlint scans the exact staged contents before a commit, and GitHub Actions scans again in CI.

## Required checks

Run this before opening a pull request:

```bash
npm run validate
```

The command checks the supported Node version, Biome formatting, ESLint boundaries, TypeScript, dependency direction, staged-secret scanning, and the production build.

If a boundary error appears, fix the dependency direction rather than disabling the rule. If a file does not fit the current model, classify it explicitly and document why before adding an exception.

## Strict-mode migration

Hybrid mode is the default. `npm run kit:preview` shows the current planned migration to strict mode without changing files. The automatic relocation and import-rewriting engine is intentionally not enabled until its migration manifest can classify unknown files and reverse changes safely.
