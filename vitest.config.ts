import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    // NFR-09: the seat engine keeps at least 95% line coverage. The rest of
    // src/lib only must not regress; its database glue is left to E2E.
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts", "src/lib/engine/fixtures/**"],
      thresholds: { lines: 75, "src/lib/engine/**": { lines: 95 } },
    },
  },
});
