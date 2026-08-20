import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";

const sharedTypes = ["shared-kernel", "shared-frontend", "shared-backend"];
const allLocalTypes = [
  "next-composition",
  "next-delivery",
  "frontend",
  "backend-domain",
  "backend-application",
  "backend-ports",
  "backend-infrastructure",
  "contracts",
  ...sharedTypes,
  "tests",
];

const elements = [
  { type: "next-composition", pattern: "src/adapters/next/composition/**/*" },
  { type: "next-delivery", pattern: "src/app/**/*" },
  { type: "frontend", pattern: "src/modules/*/frontend/**/*", capture: ["feature"] },
  { type: "backend-domain", pattern: "src/modules/*/backend/domain/**/*", capture: ["feature"] },
  {
    type: "backend-application",
    pattern: "src/modules/*/backend/application/**/*",
    capture: ["feature"],
  },
  { type: "backend-ports", pattern: "src/modules/*/backend/ports/**/*", capture: ["feature"] },
  {
    type: "backend-infrastructure",
    pattern: "src/modules/*/backend/infrastructure/**/*",
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
    plugins: {
      boundaries,
      "import-x": importX,
    },
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
                "frontend",
                "backend-application",
                "backend-ports",
                "contracts",
                ...sharedTypes,
              ]),
            },
            {
              from: { element: { type: "next-composition" } },
              allow: allowTypes([
                "backend-application",
                "backend-infrastructure",
                "backend-ports",
                "contracts",
                ...sharedTypes,
              ]),
            },
            {
              from: { element: { type: "frontend" } },
              allow: allowTypes(["frontend", "contracts", "shared-frontend", "shared-kernel"]),
            },
            {
              from: { element: { type: "backend-domain" } },
              allow: allowTypes(["backend-domain", "shared-kernel"]),
            },
            {
              from: { element: { type: "backend-application" } },
              allow: allowTypes([
                "backend-domain",
                "backend-application",
                "backend-ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
              ]),
            },
            {
              from: { element: { type: "backend-ports" } },
              allow: allowTypes(["backend-domain", "shared-kernel"]),
            },
            {
              from: { element: { type: "backend-infrastructure" } },
              allow: allowTypes([
                "backend-domain",
                "backend-application",
                "backend-ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
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
              to: { element: { type: "frontend" } },
              allow: { to: { element: { fileInternalPath: ["index.ts", "index.tsx"] } } },
            },
            {
              to: { element: { type: "backend-application" } },
              allow: { to: { element: { fileInternalPath: "index.ts" } } },
            },
            {
              to: { element: { type: "backend-ports" } },
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
