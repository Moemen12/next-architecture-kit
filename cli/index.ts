#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

type PackageManifest = Readonly<{ name?: string; private?: boolean }>;
type KitManifest = Readonly<{
  schemaVersion: 1;
  mode: "hybrid" | "clean";
  knownRoots: readonly string[];
  migrations: readonly string[];
}>;

const root = resolve(process.cwd());
const command = process.argv[2] ?? "help";
const argument = process.argv[3];
const preview = process.argv.includes("--preview");
const knownRoots = ["src/app", "src/modules", "src/shared", "src/adapters", "tests"];
const manifestFile = ".next-architecture.json";

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry): string[] => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function projectFiles(projectRoot = root): string[] {
  return knownRoots
    .flatMap((path) => walk(join(projectRoot, path)))
    .map((path) => relative(projectRoot, path));
}

function printHelp(): void {
  console.log(`Next Architecture Kit

Commands:
  create <name>          Create a new project from the hybrid template
  validate               Run validation in the current generated project
  status                 Report files known to the architecture manifest
  upgrade --preview      Preview the strict-mode migration plan
  upgrade                Refuse to mutate until a migration manifest is finalized
  revert <migration-id>  Refuse to mutate until a recorded migration exists`);
}

function readManifest(projectRoot = root): KitManifest | null {
  const file = join(projectRoot, manifestFile);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as KitManifest;
}

function writeManifest(projectRoot: string): void {
  const manifest: KitManifest = {
    schemaVersion: 1,
    mode: "hybrid",
    knownRoots,
    migrations: [],
  };
  writeFileSync(
    join(projectRoot, manifestFile),
    `{
  "schemaVersion": 1,
  "mode": "hybrid",
  "knownRoots": ["src/app", "src/modules", "src/shared", "src/adapters", "tests"],
  "migrations": []
}
`,
  );
}

function createProject(): void {
  if (!argument || argument.startsWith("-")) {
    console.error("Usage: npm run kit:create -- <project-directory>");
    process.exitCode = 2;
    return;
  }

  const target = resolve(process.cwd(), argument);
  const template = join(root, "template");
  if (resolve(target) === resolve(root) || resolve(target) === resolve(template)) {
    console.error("The project directory must be different from the kit repository.");
    process.exitCode = 2;
    return;
  }
  if (existsSync(target)) {
    console.error(`Refusing to overwrite existing directory: ${target}`);
    process.exitCode = 2;
    return;
  }

  mkdirSync(target, { recursive: true });
  cpSync(template, target, {
    recursive: true,
    filter: (source) => {
      const ignoredSegments = ["node_modules", ".next", "dist", "coverage", "tsconfig.tsbuildinfo"];
      return !source.split(/[\\\\/]+/).some((segment) => ignoredSegments.includes(segment));
    },
  });

  const packageFile = join(target, "package.json");
  const packageJson = JSON.parse(readFileSync(packageFile, "utf8")) as PackageManifest;
  writeFileSync(
    packageFile,
    `${JSON.stringify({ ...packageJson, name: argument, private: true }, null, 2)}\n`,
  );
  writeManifest(target);
  console.log(`Created ${argument} at ${target}`);
  console.log("Next steps:");
  console.log(`  cd ${argument}`);
  console.log("  npm ci");
  console.log("  npm run dev");
}

function status(): void {
  const manifest = readManifest();
  const files = projectFiles();
  const unknown = files.filter((file) => !file.endsWith(".ts") && !file.endsWith(".tsx"));
  console.log(`Inspected ${files.length} governed files.`);
  console.log(`Architecture mode: ${manifest?.mode ?? "uninitialized"}`);
  if (unknown.length > 0) {
    console.log("Files requiring manual classification:");
    for (const file of unknown) console.log(`- ${file}`);
  } else {
    console.log("No unclassified governed files found.");
  }
}

function migrationPlan(): void {
  const packageFile = join(root, "package.json");
  const packageName = existsSync(packageFile)
    ? (JSON.parse(readFileSync(packageFile, "utf8")) as PackageManifest).name
    : "current-project";
  console.log(`Migration preview for ${packageName}`);
  console.log("- classify Next.js delivery files");
  console.log("- map feature ui/domain/application/ports/infrastructure layers to strict-mode locations");
  console.log("- update imports through public feature entrypoints");
  console.log("- strengthen ESLint and dependency-graph policies");
  console.log("- write a reversible migration manifest");
  console.log("- report files that require manual review");
  if (!preview) {
    console.error("Mutation is not enabled in this release. Run with --preview while the manifest format is being finalized.");
    process.exitCode = 2;
  }
}

switch (command) {
  case "create":
    createProject();
    break;
  case "status":
    status();
    break;
  case "upgrade":
    migrationPlan();
    break;
  case "validate":
    console.log("Run `npm run validate` in the generated project to execute the complete quality gate.");
    break;
  case "revert":
    console.error("Revert requires a recorded migration manifest; no mutation was performed.");
    process.exitCode = 2;
    break;
  default:
    printHelp();
}
