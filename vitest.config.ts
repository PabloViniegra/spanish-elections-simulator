import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    // NFR-09: the seat engine keeps at least 95% line coverage.
    coverage: {
      provider: "v8",
      include: ["src/lib/engine/**/*.ts"],
      exclude: ["src/lib/engine/fixtures/**"],
      thresholds: { lines: 95 },
    },
  },
});
