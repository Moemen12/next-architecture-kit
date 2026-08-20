#!/usr/bin/env node

const [major] = process.versions.node.split(".").map(Number);
const supported = major === 22 || major === 24 || major >= 26;

if (!supported) {
  console.error(
    `Unsupported Node.js ${process.versions.node}. This template requires Node.js 22 LTS, Node.js 24 LTS, or Node.js 26+; Node.js 25 is not supported by the dependency-validation toolchain.`,
  );
  process.exit(1);
}

console.log(`Node.js ${process.versions.node} is supported.`);
