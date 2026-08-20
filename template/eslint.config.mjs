import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";

const sharedTypes = ["shared-kernel", "shared-frontend", "shared-backend"];
const allLocalTypes = [
  "next-composition",
  "next-delivery",
  "ui",
  "domain",
  "application",
  "ports",
  "infrastructure",
  "contracts",
  ...sharedTypes,
  "tests",
];

const elements = [
  { type: "next-composition", pattern: "src/adapters/next/**/*" },
  { type: "next-delivery", pattern: "src/app/**/*" },
  { type: "ui", pattern: "src/modules/*/ui/**/*", capture: ["feature"] },
  { type: "domain", pattern: "src/modules/*/domain/**/*", capture: ["feature"] },
  { type: "application", pattern: "src/modules/*/application/**/*", capture: ["feature"] },
  { type: "ports", pattern: "src/modules/*/ports/**/*", capture: ["feature"] },
  {
    type: "infrastructure",
    pattern: "src/modules/*/infrastructure/**/*",
    capture: ["feature"],
  },
  { type: "contracts", pattern: "src/modules/*/contracts/**/*", capture: ["feature"] },
  { type: "shared-kernel", pattern: "src/shared/kernel/**/*" },
  { type: "shared-frontend", pattern: "src/shared/frontend/**/*" },
  { type: "shared-backend", pattern: "src/shared/backend/**/*" },
  { type: "tests", pattern: "tests/**/*" },
];

const allowTypes = (types) => ({
  to: { element: { types: { anyOf: types } } },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries, "import-x": importX },
    settings: {
      "boundaries/elements": elements,
      "boundaries/include": ["src/**/*", "tests/**/*"],
      "import/resolver": { typescript: true },
      "import-x/resolver": { typescript: true },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "next-delivery" } },
              allow: allowTypes([
                "next-composition",
                "ui",
                "application",
                "ports",
                "contracts",
                ...sharedTypes,
              ]),
            },
            {
              from: { element: { type: "next-composition" } },
              allow: allowTypes([
                "application",
                "infrastructure",
                "ports",
                "next-composition",
                "contracts",
                ...sharedTypes,
              ]),
            },
            {
              from: { element: { type: "ui" } },
              allow: allowTypes(["ui", "contracts", "shared-frontend", "shared-kernel"]),
            },
            {
              from: { element: { type: "domain" } },
              allow: allowTypes(["domain", "shared-kernel"]),
            },
            {
              from: { element: { type: "application" } },
              allow: allowTypes([
                "domain",
                "application",
                "ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
              ]),
            },
            {
              from: { element: { type: "ports" } },
              allow: allowTypes(["domain", "shared-kernel"]),
            },
            {
              from: { element: { type: "infrastructure" } },
              allow: allowTypes([
                "domain",
                "application",
                "ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
                "infrastructure",
              ]),
            },
            { from: { element: { type: "contracts" } }, allow: allowTypes(["shared-kernel"]) },
            {
              from: { element: { type: "shared-frontend" } },
              allow: allowTypes(["shared-frontend", "shared-kernel"]),
            },
            {
              from: { element: { type: "shared-backend" } },
              allow: allowTypes(["shared-backend", "shared-kernel"]),
            },
            { from: { element: { type: "shared-kernel" } }, allow: allowTypes(["shared-kernel"]) },
            { from: { element: { type: "tests" } }, allow: allowTypes(allLocalTypes) },
            {
              to: { element: { type: "next-composition" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "infrastructure" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "shared-backend" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "ui" } },
              allow: { to: { element: { fileInternalPath: ["index.ts", "index.tsx"] } } },
            },
            {
              to: { element: { type: "application" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "ports" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "contracts" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
          ],
        },
      ],
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import-x/no-duplicates": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**", "reports/**"]),
]);

export default eslintConfig;
