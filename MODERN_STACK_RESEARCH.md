# Modern Stack Research Notes

## Current registry snapshot

The live npm registry reports the following versions at the time of review:

| Package | Latest reported version | Relevant constraint |
|---|---:|---|
| `next` | 16.3.1 | Node >=20.9.0; React 18 or 19 |
| `react` / `react-dom` | 19.2.8 | `react-dom` peers with React 19.2.8 |
| `typescript` | 7.0.2 | TypeScript 7 is a new native compiler line |
| `eslint` | 10.8.1 | Node ^20.19, ^22.13, or >=24 |
| `eslint-config-next` | 16.3.1 | ESLint >=9; TypeScript >=3.3.1 |
| `eslint-plugin-boundaries` | 7.2.0 | Node >=18.18; ESLint >=6 |
| `eslint-plugin-import-x` | 4.17.1 | ESLint 8/9/10; typescript-eslint utils 8.56+ |
| `dependency-cruiser` | 18.2.0 | Node ^22, ^24, or >=26; rejects Node 25 |
| `prettier` | 3.9.6 | Node >=14 |
| `valibot` | 1.4.2 | TypeScript >=5 |
| `ky` | 2.0.2 | Node >=22 |
| `ofetch` | 1.5.1 | No engine constraint reported |
| `undici` | 8.10.0 | Node >=22.19.0 |
| `vitest` | 4.1.11 | Node 20, 22, or >=24 |
| `playwright` | 1.62.1 | Node >=20 |

## Decisions to verify

Next.js 16 officially recommends ESLint flat config and the `eslint` CLI; `next lint` is removed. Therefore `eslint.config.mjs` is a current configuration form, not a legacy `.eslintrc` form. The repository should retain it unless a modern alternative is demonstrably better for enforcing the custom architecture policies.

TypeScript 7.0.2 is the latest reported compiler, but the TypeScript 7 release announcement states that it does not ship the compiler API yet and recommends a TypeScript 6 compatibility alias for tools such as typescript-eslint that still import the TypeScript API. Since the template depends on Next.js ESLint TypeScript integration, TypeScript 7 must be tested before adoption rather than upgraded blindly.

Node 25.2.1 is not a supported runtime for dependency-cruiser 18.2.0. The supported production choice should be Node 24 LTS, or Node 22 LTS if a broader compatibility window is needed. Node 25 should be rejected by the template’s runtime guard with a clear message instead of failing deep inside a dependency.

Native `fetch` should remain the default HTTP mechanism. The template does not need Axios. If a higher-level client is needed later, `ky` or `ofetch` must be evaluated against the deployment runtime and adapter boundaries rather than installed globally.

Biome is a modern formatter/linter alternative, but ESLint remains obligatory for this project because the architecture boundary rules and Next.js policy are already expressed through ESLint plugins. A production design can use ESLint for policy and Biome for formatting only, but this should be verified for consistent formatting and editor support before replacing Prettier.

## Sources

1. [Next.js Installation and System Requirements](https://nextjs.org/docs/app/getting-started/installation)
2. [Next.js ESLint Configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
3. [TypeScript 7.0 Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
4. [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
5. [Biome migration guidance](https://biomejs.dev/guides/migrate-eslint-prettier/)
