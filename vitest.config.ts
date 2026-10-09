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
      exclude: [
        "src/lib/**/*.test.ts",
        "src/lib/engine/fixtures/**",
        // Database, Better Auth and Resend glue, covered by E2E.
        "src/lib/db/**",
        "src/lib/**/actions.ts",
        "src/lib/**/queries.ts",
        "src/lib/rate-limit/store.ts",
        "src/lib/auth/{auth,session}.ts",
        "src/lib/email/send-*-email.ts",
      ],
      thresholds: { lines: 85, "src/lib/engine/**": { lines: 95 } },
    },
  },
});
