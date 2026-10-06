import { describe, expect, it } from "vitest";
import { provinces } from "./provinces";
import { seats2023 } from "./seats-2023";
import { seats2026 } from "./seats-2026";

describe.each([
  { name: "seats2023", seats: seats2023 },
  { name: "seats2026", seats: seats2026 },
])("$name", ({ seats }) => {
  it("covers every constituency", () => {
    expect([...seats.keys()].sort()).toEqual(provinces.map((p) => p.code).sort());
  });

  it("adds up to the 350 seats of the Congreso", () => {
    expect([...seats.values()].reduce((sum, n) => sum + n, 0)).toBe(350);
  });
});
