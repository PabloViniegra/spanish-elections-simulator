import { describe, expect, it } from "vitest";
import { provinceCode, usageProfile } from "./user-fields";

describe("provinceCode", () => {
  it.each(["01", "28", "50", "51", "52"])("accepts %s", (code) => {
    expect(provinceCode.safeParse(code).success).toBe(true);
  });

  it.each(["00", "53", "99", "1", "028", "AB"])("rejects %s", (code) => {
    expect(provinceCode.safeParse(code).success).toBe(false);
  });
});

describe("usageProfile", () => {
  it("rejects profiles outside the allowed list", () => {
    expect(usageProfile.safeParse("journalist").success).toBe(true);
    expect(usageProfile.safeParse("admin").success).toBe(false);
  });
});
