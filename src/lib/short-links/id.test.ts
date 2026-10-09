import { describe, expect, it } from "vitest";
import { shortLinkId } from "./id";

describe("shortLinkId", () => {
  it("gives the same scenario the same short, URL-safe id", async () => {
    const id = await shortLinkId("v1.scenario");
    expect(id).toMatch(/^[\w-]{10}$/);
    expect(await shortLinkId("v1.scenario")).toBe(id);
    expect(await shortLinkId("v1.other")).not.toBe(id);
  });
});
