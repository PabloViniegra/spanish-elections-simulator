import type { CSSProperties } from "react";

export function cssVar(name: `--${string}`, value: number): CSSProperties {
  // SAFETY: the object has one `--*` key, which React applies as a custom property that CSSProperties omits.
  return { [name]: value } as CSSProperties;
}
