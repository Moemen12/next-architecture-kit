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

function isServerOnlyDoor(relativePath: string): boolean {
  const isPublicBarrel = relativePath.endsWith("/index.ts");

  return (
    (relativePath.startsWith("src/app/api/") && relativePath.endsWith("/route.ts")) ||
    (relativePath.startsWith("src/app/") && relativePath.endsWith("/actions.ts")) ||
    (relativePath.startsWith("src/adapters/next/") && isPublicBarrel) ||
    (relativePath.startsWith("src/shared/backend/") && isPublicBarrel) ||
    (relativePath.includes("/infrastructure/") && isPublicBarrel)
  );
}

const sourceRoot = join(root, "src");
const serverOnlyDoors = collectFiles(sourceRoot).filter((file) =>
  isServerOnlyDoor(relative(root, file).replaceAll("\\", "/")),
);
const missing = serverOnlyDoors.filter(
  (file) => !/^\s*import\s+["']server-only["'];/m.test(readFileSync(file, "utf8")),
);

if (missing.length > 0) {
  console.error("Every server-only door must import server-only:");
  for (const file of missing) console.error(`- ${relative(root, file).replaceAll("\\", "/")}`);
  process.exit(1);
}

console.log(`Server-only boundary passed for ${serverOnlyDoors.length} door(s).`);
