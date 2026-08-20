const dependencyCruiserConfig = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Circular dependencies make feature extraction and strict-mode migration unsafe.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-next-in-policy",
      comment: "Domain, application, ports, and contracts must remain independent of Next.js.",
      severity: "error",
      from: {
        path: "^src/modules/[^/]+/backend/(domain|application|ports)/|^src/modules/[^/]+/contracts/|^src/shared/(kernel|backend)/",
      },
      to: { path: "(^|/)node_modules/next/|(^|/)node_modules/next-" },
    },
    {
      name: "no-backend-to-frontend",
      comment: "Backend policy must not depend on presentation code.",
      severity: "error",
      from: { path: "^src/modules/[^/]+/backend/" },
      to: { path: "^src/modules/[^/]+/frontend/|^src/shared/frontend/" },
    },
    {
      name: "no-unresolved",
      comment: "Every governed import must resolve.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-orphans",
      comment: "Orphaned files in governed source are reported for review.",
      severity: "warn",
      from: {
        orphan: true,
        pathNot:
          "(^|/)(page|layout|loading|error|not-found|route|template|default|middleware)[.]tsx?$",
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "(^|/)node_modules/" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      mainFields: ["types", "main"],
    },
    exclude: "(^|/)(node_modules|.next|out|build|coverage|reports)/",
    reporterOptions: {
      dot: { collapsePattern: "node_modules/(ына|.*)" },
    },
  },
};

export default dependencyCruiserConfig;
