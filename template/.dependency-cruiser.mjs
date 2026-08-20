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
        path: "^src/modules/[^/]+/(domain|application|ports)/|^src/modules/[^/]+/contracts/|^src/shared/(kernel|backend)/",
      },
      to: { path: "(^|/)node_modules/next/|(^|/)node_modules/next-" },
    },
    {
      name: "no-core-to-ui",
      comment: "Feature policy and infrastructure must not depend on presentation code.",
      severity: "error",
      from: { path: "^src/modules/[^/]+/(domain|application|ports|infrastructure)/" },
      to: { path: "^src/modules/[^/]+/ui/|^src/shared/frontend/" },
    },
    {
      name: "no-unresolved",
      comment: "Every governed import must resolve.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
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
