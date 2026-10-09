import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://localhost:${port}`;

// The server and the tests share the throwaway database from compose.e2e.yml,
// never the one in .env.local.
process.env.DATABASE_URI = "postgres://postgres:postgres@db.localtest.me:5432/main";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /\.setup\.ts$/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, dependencies: ["setup"] },
  ],
  webServer: {
    command: `pnpm start --port ${port}`,
    url: baseURL,
    // A server started elsewhere could be using another database.
    reuseExistingServer: false,
    env: {
      DATABASE_URI: process.env.DATABASE_URI,
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET: "e2e-placeholder-secret-not-used-in-production",
      // Never send real email; the setup confirms addresses in the database.
      RESEND_API_KEY: "",
    },
  },
});
