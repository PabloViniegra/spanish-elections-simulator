import { describe, expect, it } from "vitest";
import { provinceCode } from "./auth/user-fields";
import { provinces } from "./provinces";

describe("provinces", () => {
  it("lists the 52 constituencies with unique, valid INE codes", () => {
    const codes = provinces.map((province) => province.code);
    expect(new Set(codes).size).toBe(52);
    for (const code of codes) expect(provinceCode.safeParse(code).success).toBe(true);
  });
});
