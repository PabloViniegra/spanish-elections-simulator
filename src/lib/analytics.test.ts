import { describe, expect, it } from "vitest";
import { redactAnalyticsQuery } from "./analytics";

describe("Vercel Analytics event redaction", () => {
  it("removes all query parameters before an event is sent", () => {
    const event = {
      type: "pageview" as const,
      url: "https://example.test/simulator?e=private-scenario&utm_source=newsletter",
    };

    expect(redactAnalyticsQuery(event)).toEqual({
      type: "pageview",
      url: "https://example.test/simulator",
    });
  });
});
