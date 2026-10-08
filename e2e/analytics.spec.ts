import { expect, test } from "@playwright/test";

test("analytics strips queries from event URLs and same-origin referrers", async ({ page }) => {
  // Stand in for the hosted tracker, exercising the SDK's real beforeSend hook
  // and the browser's referrer policy without contacting Vercel.
  await page.route("**/_vercel/insights/script.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
        let beforeSend;
        window.va = (type, value) => {
          if (type === "beforeSend") beforeSend = value;
          if (type === "pageview") {
            const event = beforeSend({ type: "pageview", url: location.href });
            fetch("/_vercel/insights/view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(event)
            });
          }
        };
        for (const args of window.vaq || []) window.va(...args);
      `,
    }),
  );
  await page.route("**/_vercel/insights/view", (route) => route.fulfill({ status: 204 }));

  const pendingEvent = page.waitForRequest("**/_vercel/insights/view");
  const response = await page.goto("/?e=private-scenario&utm_source=newsletter");
  const event = await pendingEvent;
  const origin = new URL(page.url()).origin;

  expect(response!.headers()["referrer-policy"]).toBe("strict-origin");
  expect(event.postDataJSON()).toEqual({ type: "pageview", url: `${origin}/` });
  expect(await event.headerValue("referer")).toBe(`${origin}/`);
  expect(page.url()).toContain("e=private-scenario");
});
