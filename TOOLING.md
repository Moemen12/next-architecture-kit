# Baseline Tooling Policy

## Core baseline

The kit uses the current stable Next.js App Router baseline verified by the release process. The current tested baseline is Next.js `16.3.1`, React `19.2.8`, TypeScript `6.0.3`, ESLint `9.39.5`, `eslint-config-next` `16.3.1`, `eslint-plugin-boundaries` `7.2.0`, `dependency-cruiser` `18.2.0`, Biome `2.5.9`, and Zod `4.4.3`. These values are release inputs, not permanent promises; the repository must test a compatible set before updating them.

The generated application should include only the packages that support the architecture itself:

| Package/category | Status | Purpose |
|---|---|---|
| Next.js, React, React DOM | Required runtime | App Router and React rendering |
| TypeScript | Required | Strict static typing and project language |
| ESLint and `eslint-config-next` | Required | Next.js, React, hooks, and core web-vitals linting |
| `@typescript-eslint` integration | Required through the Next ESLint config | TypeScript-aware lint rules |
| `eslint-plugin-boundaries` | Required | Enforce classified architectural dependencies in ESLint |
| `eslint-plugin-import` or maintained equivalent | Required | Import hygiene, resolution, and export rules |
| `dependency-cruiser` | Required CI validator | Graph-level rules, cycles, orphans, and reports that are awkward in ESLint |
| Biome | Required | Deterministic formatting without architectural semantics |
| Zod | Required baseline utility | Runtime validation at external boundaries and typed environment configuration |
| GitHub Actions | Required repository policy | Reproducible lint, typecheck, build, boundary, and secret checks |
| Secret scanner | Required policy, not necessarily an npm dependency | Local and CI detection of credentials before publication |

The kit must not install a database driver, ORM, authentication provider, queue, cache, WebSocket library, HTTP client, UI component library, or browser test framework by default. Those are infrastructure decisions and belong in explicit integrations.

## ESLint configuration policy

The kit uses ESLint flat config. It extends the Next.js Core Web Vitals configuration and TypeScript configuration, then adds the architecture policy. Next.js 16 no longer runs linting implicitly during `next build`, so the CI pipeline must invoke linting as an explicit step.

The architecture rules should classify files by role and feature. At minimum, the configuration must distinguish Next delivery files, frontend files, backend domain/application/ports/infrastructure files, contracts, shared kernel, tests, and external modules. Policies must reject framework and vendor imports from inward layers, backend-to-frontend imports, private cross-feature imports, and imports that bypass public feature entrypoints.

The ESLint configuration is a policy artifact. It should be generated and maintained by the kit, but it should remain readable so developers can understand why an import fails. Rules must be errors in CI; warnings are reserved for advisory reports and migration discovery.

## Dependency-cruiser policy

ESLint provides immediate editor feedback, while dependency-cruiser validates the resolved project graph. Its rules should at least detect:

- circular dependencies;
- forbidden imports from domain/application to Next.js, React delivery APIs, or external infrastructure packages;
- cross-feature imports that do not use a public entrypoint;
- unresolved imports;
- orphaned governed files;
- unexpected dependencies from delivery into infrastructure internals.

The dependency-cruiser report is also used by the migration CLI to classify unknown files and explain why a project cannot be upgraded automatically.

## Secret protection policy

Secret protection is defense in depth:

1. `.gitignore` excludes local environment files, build output, IDE state, and generated reports.
2. `.env.example` contains names and safe placeholder values only.
3. A typed environment module validates required variables at runtime and prevents ad-hoc `process.env` access outside the configuration boundary.
4. A local secret scan runs before commits when the developer has the scanner installed.
5. CI scans the complete repository history and the pull request diff.
6. The public GitHub repository enables available secret-scanning and push-protection settings.

Gitleaks is suitable as an external binary/action, but it must not be treated as a normal application runtime dependency. Its upstream project describes itself as feature complete and focused on security maintenance, so the kit should keep the scanner replaceable behind a repository script. GitHub push protection remains an important server-side layer and can block detected secrets before they reach the repository.

No scanner guarantees that every secret is detected. The documentation must instruct users to revoke and rotate a credential immediately if it is exposed, even when a push is blocked or a finding is later dismissed.

## Formatting and hooks

Formatting must be deterministic and separate from architecture. The kit may provide a local `format` script and a staged-file hook, but a developer should always be able to run the full checks directly. Hooks improve feedback time; CI remains authoritative.

The canonical scripts are:

```text
lint          ESLint policy and Next.js rules
lint:fix      ESLint automatic fixes where safe
typecheck     TypeScript no-emit check
format        Biome formatting write
format:check  Biome formatting verification
architecture  ESLint/dependency-cruiser architecture checks
test          Unit and architecture tests when present
validate      The complete local quality gate
```

## Versioning policy

The kit uses a tested release matrix rather than blindly installing `latest` into user projects. The source repository commits its lockfile. Renovate or Dependabot may open update pull requests, but updates merge only after lint, typecheck, architecture validation, build, and template-generation tests pass.

Each kit release records the tested Node.js major, package-manager version, Next.js version, React version, TypeScript version, ESLint version, and boundary-validator versions. A patch release fixes the kit without intentional architecture changes. A minor release may add rules or optional capabilities without changing valid user code. A major release may move directories, strengthen boundaries, or alter migration manifests.

Generated projects own their dependency upgrades after creation. The kit's `upgrade` command updates architecture mode and kit-owned configuration only when explicitly requested; it does not run an unbounded dependency upgrade.

## Optional integrations

Optional integrations must follow one shape:

```text
external provider -> infrastructure adapter -> application-owned port
```

The public API of the feature cannot expose provider-specific types. For example, a repository contract may return an application-owned `UserRecord`; it must not return a Prisma model. A database adapter may use Prisma or Drizzle internally, but the rest of the application calls the neutral contract.

## Modern verified baseline

The current verified baseline uses Next.js `16.3.1`, React `19.2.8`, ESLint `9.39.5`, `eslint-config-next` `16.3.1`, TypeScript `6.0.3`, `eslint-plugin-boundaries` `7.2.0`, `eslint-plugin-import-x` `4.17.1`, `dependency-cruiser` `18.2.0`, Biome `2.5.9`, and Zod `4.4.3`.

The package policy is latest-stable-first, not latest-number-blind. TypeScript `7.0.2` is currently the newest compiler release, but the current `typescript-eslint` integration used by `eslint-config-next` does not support TypeScript 7. The kit therefore selects TypeScript `6.0.3`, the newest compatible compiler line, and will move to TypeScript 7 when the required ESLint/Next integration supports it without compatibility aliases or unsupported peer overrides.

ESLint `10.8.1` is newer, but the Next.js plugin dependencies used by `eslint-config-next` still declare peer ranges ending at ESLint 9. The kit therefore uses ESLint `9.39.5`, the newest compatible major, while retaining flat `eslint.config.mjs`, which is the current official Next.js configuration form. Biome `2.5.9` is used for formatting because it is a current unified formatter; ESLint remains mandatory because the architecture boundary policies are expressed through ESLint plugins.

The supported Node.js matrix is Node 22 LTS, Node 24 LTS, or Node 26 and newer. Node 25 is intentionally rejected because dependency-cruiser does not support that release line. The template checks this before the full validation pipeline and reports the required runtime directly.

The template uses native `fetch` for HTTP by default. It does not install Axios or another global HTTP client. Any future higher-level client must be introduced inside an infrastructure adapter after its runtime and caching behavior are verified for the deployment target.

## TypeScript-first scripts and configuration

The CLI source lives in `cli/index.ts` and is compiled into `dist/` before it is exposed as an executable package binary. The template runtime check lives in `scripts/check-runtime.ts` and runs through `tsx` during development and validation.

The ESLint and dependency-cruiser configuration files remain explicit ESM configuration modules because their current loaders do not provide a reliable direct TypeScript configuration contract. This is intentional: application and CLI logic are TypeScript, while tool configuration uses the format officially supported by each tool. A future migration to `eslint.config.ts` or a dependency-cruiser TypeScript config should happen only after the loaders support it without wrappers or experimental behavior.

## Boundary libraries

`zod` is used in feature contracts, delivery parsing, infrastructure response validation, and environment configuration. Domain, application, and ports remain independent of Zod and receive typed values instead. `server-only` is used at server-runtime boundaries such as shared backend environment access, infrastructure adapters, and Next.js composition roots. It is intentionally not imported into portable domain or application code.
