import type { CSSProperties } from "react";

const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function VisuallyHidden({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span style={visuallyHiddenStyle}>{children}</span>;
}
