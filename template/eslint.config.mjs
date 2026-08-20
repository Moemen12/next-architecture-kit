import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importX from "eslint-plugin-import-x";

const elements = [
  { type: "next-delivery", pattern: ["src/app/**/*", "src/adapters/next/**/*"] },
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
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "next-delivery",
              allow: ["frontend", "backend-application", "backend-ports", "contracts", "shared-*"],
            },
            {
              from: "frontend",
              allow: ["frontend", "contracts", "shared-frontend", "shared-kernel"],
            },
            { from: "backend-domain", allow: ["backend-domain", "shared-kernel"] },
            {
              from: "backend-application",
              allow: [
                "backend-domain",
                "backend-application",
                "backend-ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
              ],
            },
            { from: "backend-ports", allow: ["backend-domain", "shared-kernel"] },
            {
              from: "backend-infrastructure",
              allow: [
                "backend-domain",
                "backend-application",
                "backend-ports",
                "contracts",
                "shared-backend",
                "shared-kernel",
              ],
            },
            { from: "contracts", allow: ["shared-kernel"] },
            { from: "shared-frontend", allow: ["shared-frontend", "shared-kernel"] },
            { from: "shared-backend", allow: ["shared-backend", "shared-kernel"] },
            { from: "shared-kernel", allow: ["shared-kernel"] },
            { from: "tests", allow: ["*", "tests"] },
          ],
        },
      ],
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            { target: "frontend", allow: "src/modules/*/frontend/index.ts" },
            { target: "backend-application", allow: "src/modules/*/backend/application/index.ts" },
            { target: "backend-ports", allow: "src/modules/*/backend/ports/index.ts" },
            { target: "contracts", allow: "src/modules/*/contracts/index.ts" },
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
