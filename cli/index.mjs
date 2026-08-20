#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const command = process.argv[2] ?? "help";
const preview = process.argv.includes("--preview");

const knownRoots = ["src/app", "src/modules", "src/shared", "src/adapters", "tests"];

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function projectFiles() {
  return knownRoots.flatMap((path) => walk(join(root, path))).map((path) => relative(root, path));
}

function printHelp() {
  console.log(`Next Architecture Kit\n\nCommands:\n  validate              Run the generated project's validation script\n  status                Report files known to the architecture manifest\n  upgrade --preview     Preview the strict-mode migration plan\n  upgrade               Refuse to mutate until a migration manifest is present\n  revert <migration-id> Refuse to mutate until a migration manifest is present`);
}

function status() {
  const files = projectFiles();
  const unknown = files.filter((file) => !file.endsWith(".ts") && !file.endsWith(".tsx"));
  console.log(`Inspected ${files.length} governed files.`);
  if (unknown.length > 0) {
    console.log("Files requiring manual classification:");
    for (const file of unknown) console.log(`- ${file}`);
  } else {
    console.log("No unclassified governed files found.");
  }
}

function migrationPlan() {
  const packageFile = join(root, "package.json");
  const packageName = existsSync(packageFile)
    ? JSON.parse(readFileSync(packageFile, "utf8")).name
    : "current-project";
  console.log(`Migration preview for ${packageName}`);
  console.log("- classify Next.js delivery files");
  console.log("- map feature frontend/backend folders to strict-mode locations");
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
