import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const secretlint = join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "secretlint.cmd" : "secretlint",
);

if (!existsSync(secretlint)) {
  console.error("Secretlint is not installed. Run npm ci before committing.");
  process.exit(1);
}

const stagedFiles = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  cwd: root,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean)
  .filter((file) => !/(^|\/)(node_modules|\.git|\.next|dist|coverage)(\/|$)/.test(file));

for (const file of stagedFiles) {
  const content = execFileSync("git", ["show", `:${file}`], { cwd: root });
  const result = spawnSync(secretlint, [`--stdinFileName=${file}`], {
    cwd: root,
    input: content,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (result.status !== 0) {
    console.error(`Secret scan failed for staged file: ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`Secret scan passed for ${stagedFiles.length} staged file(s).`);
