import { expect, test } from "@playwright/test";

test("production HTML gets a fresh nonce and hydration works without inline script permission", async ({ page, request }) => {
  // The hosted analytics endpoint does not exist on a local Next server.
  await page.route("**/_vercel/insights/script.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: 'document.documentElement.dataset.analyticsLoaded = "true";',
  }));
  // Inject a parser-inserted script without a nonce into the local response.
  await page.route("**/simulator", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace("</head>", '<script data-csp-probe>document.documentElement.dataset.untrustedScript = "executed";</script></head>');
    await route.fulfill({ response, body });
  });
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/violates.*Content Security Policy|Refused to (execute|load).*script/i.test(message.text())) violations.push(message.text());
  });
  const response = await page.goto("/simulator", { waitUntil: "networkidle" });
  const policy = response!.headers()["content-security-policy"];
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  const scripts = policy.split(";").find((directive) => directive.trim().startsWith("script-src "));
  expect(scripts).not.toContain("'unsafe-inline'");
  expect(scripts).not.toContain("'unsafe-eval'");
  expect(response!.headers()["cache-control"]).toContain("no-store");
  expect(await page.locator("script:not([src]):not([data-csp-probe])").evaluateAll((elements) => elements.every((element) => element instanceof HTMLScriptElement && Boolean(element.nonce)))).toBe(true);
  expect(await page.locator('script[type="application/ld+json"]').evaluate((element) => element instanceof HTMLScriptElement ? element.nonce : null)).toBe(nonce);

  await page.getByRole("spinbutton", { name: "PP", exact: true }).fill("40");
  await expect(page.getByRole("spinbutton", { name: "PP", exact: true })).toHaveValue("40");
  expect(violations).toHaveLength(1);
  await expect(page.locator("html")).toHaveAttribute("data-analytics-loaded", "true");

  await expect(page.locator("html")).not.toHaveAttribute("data-untrusted-script", "executed");
  expect(violations.some((message) => /Content Security Policy/i.test(message))).toBe(true);

  const second = await request.get("/simulator", { headers: { "x-nonce": "attacker-controlled" } });
  const secondNonce = second.headers()["content-security-policy"].match(/'nonce-([^']+)'/)?.[1];
  expect(secondNonce).toBeTruthy();
  expect(secondNonce).not.toBe(nonce);
  expect(secondNonce).not.toBe("attacker-controlled");
});
