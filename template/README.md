# Next.js Architecture Kit Template

This is a single-repository Next.js App Router application generated from Next Architecture Kit. It uses npm, strict TypeScript, ESLint boundary rules, dependency-graph validation, Biome formatting, and typed environment access.

## Getting started

Use Node.js 22 LTS, Node.js 24 LTS, or Node.js 26 and newer. Node.js 25 is intentionally unsupported by the dependency-validation toolchain:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality gate

```bash
npm run validate
```

The validation command checks the supported runtime, runs Biome formatting, ESLint, TypeScript, dependency-boundary validation, and a production build. The project uses `package-lock.json` and `npm ci` in CI for reproducible installation. TypeScript 6 is currently selected because the Next.js TypeScript ESLint integration does not yet support TypeScript 7.

## Structure

```text
src/
├── app/                         # Next.js delivery only
├── modules/<feature>/
│   ├── frontend/                # portable React presentation
│   ├── backend/
│   │   ├── domain/              # business rules
│   │   ├── application/         # use cases
│   │   ├── ports/               # stable contracts
│   │   └── infrastructure/      # concrete adapters
│   └── contracts/               # boundary DTOs and schemas
├── shared/                      # small cross-feature primitives
└── adapters/next/               # explicit Next.js bridges
```

Next.js Route Handlers and Server Actions belong at the delivery edge. They translate transport input and output; they do not contain domain rules or direct database calls. Business policy must not import Next.js, React delivery APIs, or concrete vendor libraries.

## Environment variables

Copy `.env.example` to `.env.local` and replace only the values required by your application. Do not commit `.env.local` or credentials. Access environment variables through the typed boundary in `src/shared/backend/env.ts` rather than reading `process.env` throughout the codebase.
