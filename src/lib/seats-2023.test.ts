import { describe, expect, it } from "vitest";
import { provinces } from "./provinces";
import { seats2023 } from "./seats-2023";

describe("seats2023", () => {
  it("covers every constituency", () => {
    expect([...seats2023.keys()].sort()).toEqual(provinces.map((p) => p.code).sort());
  });

  it("adds up to the 350 seats of the Congreso", () => {
    expect([...seats2023.values()].reduce((sum, n) => sum + n, 0)).toBe(350);
  });
});
