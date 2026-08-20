# Next Architecture Kit

**Next Architecture Kit** is an opinionated starter for new Next.js App Router applications. It combines feature-based organization with a pragmatic Clean Architecture boundary model: business policy stays framework-neutral, Next.js remains at the delivery edge, and infrastructure implementations sit behind application-owned contracts.

## Why this exists

Many projects begin with a simple feature-based structure and later discover that framework imports, database types, transport concerns, and UI code have become inseparable. Full Clean Architecture can be valuable, but applying every pattern immediately often adds ceremony before the product has earned it.

This kit starts with the useful middle ground. Features stay cohesive, but their important boundaries are explicit from the first commit. The default structure is designed so a future strict-mode migration can move files and strengthen rules instead of forcing a business-logic rewrite.

## Repository layout

```text
.
├── ARCHITECTURE.md       # dependency direction and folder contract
├── TOOLING.md            # baseline package and security policy
└── template/             # generated single-repository Next.js application
```

The generated application uses this shape:

```text
src/
├── app/                  # Next.js App Router delivery only
├── modules/<feature>/
│   ├── frontend/         # portable React presentation
│   ├── backend/
│   │   ├── domain/       # business rules
│   │   ├── application/  # use cases
│   │   ├── ports/        # stable contracts
│   │   └── infrastructure/# concrete adapters
│   └── contracts/        # boundary DTOs and schemas
├── shared/               # small cross-feature primitives
└── adapters/next/        # explicit Next.js bridges
```

## Try the template

```bash
cd template
pnpm install --frozen-lockfile
pnpm dev
```

The template requires Node.js 20.9 or newer and uses pnpm 11. The initial dependency baseline is pinned and committed through `pnpm-lock.yaml`; it is not generated from unbounded `latest` ranges.

## Validation

Run the complete local quality gate with:

```bash
pnpm validate
```

The gate checks formatting, ESLint, TypeScript, dependency boundaries, and the production build. The repository workflow also runs a Gitleaks secret scan. Users should enable GitHub secret scanning and push protection for public repositories where available; local and CI scanning are additional layers, not replacements for credential rotation.

## Boundary philosophy

The core rule is simple:

> Next.js delivery may depend on application policy. Application policy must not depend on Next.js.

The validator checks actual imports and the dependency graph. Folder names alone do not make an architecture clean. A domain module importing `next/headers`, a database driver, or another feature's private implementation is a violation even if the file is located in a folder named `domain`.

Features expose public entrypoints. Other features may not import private implementation folders directly. This is the seam that later allows a feature to be extracted into an adapter or package.

## Roadmap

The next releases will add the project-generation CLI and a migration manifest. The intended commands are:

```text
next-architecture create <name>
next-architecture validate
next-architecture upgrade --preview
next-architecture upgrade
next-architecture revert <migration-id>
```

Upgrade will classify known files, transform supported paths and imports, strengthen the boundary policy, and report unknown files for manual review. Revert will use the migration manifest rather than guessing from the current folder names. The tool will never silently delete or relocate an unclassified file.

## License

MIT. See `LICENSE`.
