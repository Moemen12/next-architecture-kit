import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const extensions = new Set([".ts", ".tsx"]);

type Violation = { file: string; specifier: string; reason: string };

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    return extensions.has(path.slice(path.lastIndexOf("."))) ? [path] : [];
  });
}

function importsFrom(source: string): string[] {
  return [...source.matchAll(/\b(?:from\s+|import\s*)(["'])([^"']+)\1/g)].map((match) => match[2]);
}

function checkImport(file: string, specifier: string): Violation | undefined {
  const path = relative(root, file).replaceAll("\\", "/");
  const isUi = /^(src\/modules\/[^/]+\/ui\/|src\/shared\/frontend\/)/.test(path);
  const isDelivery = path.startsWith("src/app/");

  if (specifier.startsWith("@/modules/") && /\/infrastructure\//.test(specifier)) {
    return {
      file: path,
      specifier,
      reason:
        "Import infrastructure through @/modules/<feature>/infrastructure, never through an internal file path.",
    };
  }

  if (specifier.startsWith("@/adapters/next/composition/")) {
    return {
      file: path,
      specifier,
      reason:
        "Import Next server composition through @/adapters/next, never through a composition leaf.",
    };
  }

  if (specifier.startsWith("@/shared/backend/") && !path.startsWith("src/shared/backend/")) {
    return {
      file: path,
      specifier,
      reason: "Import shared backend capabilities through @/shared/backend.",
    };
  }

  if (
    isUi &&
    (specifier.startsWith("@/shared/backend") ||
      specifier.startsWith("@/adapters/next") ||
      /^@\/modules\/[^/]+\/(domain|application|ports|infrastructure)(\/|$)/.test(specifier))
  ) {
    return {
      file: path,
      specifier,
      reason: "Portable UI cannot import server backend or Next adapter code.",
    };
  }

  if (
    isDelivery &&
    specifier.startsWith("@/modules/") &&
    /\/(domain|ports|infrastructure)(\/|$)/.test(specifier)
  ) {
    return {
      file: path,
      specifier,
      reason:
        "Next delivery may use feature public APIs, contracts, and UI, but not backend implementation layers directly.",
    };
  }

  return undefined;
}

const violations = collectFiles(sourceRoot).flatMap((file) =>
  importsFrom(readFileSync(file, "utf8"))
    .map((specifier) => checkImport(file, specifier))
    .filter((violation): violation is Violation => violation !== undefined),
);

if (violations.length > 0) {
  console.error("Public import boundary failed:");
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.specifier}`);
    console.error(`  ${violation.reason}`);
  }
  process.exit(1);
}

console.log("Public import boundary passed.");
