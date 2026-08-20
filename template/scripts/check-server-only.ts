import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const extensions = new Set([".ts", ".tsx"]);

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    return extensions.has(path.slice(path.lastIndexOf("."))) ? [path] : [];
  });
}

function isServerBoundary(relativePath: string): boolean {
  return (
    relativePath.startsWith("src/adapters/next/") ||
    relativePath.startsWith("src/shared/backend/") ||
    relativePath.includes("/infrastructure/") ||
    relativePath.startsWith("src/app/api/") ||
    relativePath === "src/app/actions.ts"
  );
}

const sourceRoot = join(root, "src");
const serverFiles = collectFiles(sourceRoot).filter((file) =>
  isServerBoundary(relative(root, file).replaceAll("\\", "/")),
);
const missing = serverFiles.filter(
  (file) => !/^\s*import\s+["']server-only["'];/m.test(readFileSync(file, "utf8")),
);

if (missing.length > 0) {
  console.error("Every server-boundary file must import server-only:");
  for (const file of missing) console.error(`- ${relative(root, file).replaceAll("\\", "/")}`);
  process.exit(1);
}

console.log(`Server-only boundary passed for ${serverFiles.length} file(s).`);
