import { describe, expect, it } from "vitest";
import { minimalWinningCoalitions } from "./coalitions";

describe("minimalWinningCoalitions (FR-08)", () => {
  it("lists only coalitions that need every member", () => {
    const seats = new Map([
      ["a", 150],
      ["b", 120],
      ["c", 40],
      ["d", 30],
      ["e", 10],
      ["f", 0],
    ]);
    expect(minimalWinningCoalitions(seats)).toEqual([
      { members: ["a", "b"], seats: 270 },
      { members: ["a", "c"], seats: 190 },
      { members: ["a", "d"], seats: 180 },
      { members: ["b", "c", "d"], seats: 190 },
    ]);
  });

  it("returns a single bloc with a majority on its own", () => {
    expect(minimalWinningCoalitions(new Map([["a", 180], ["b", 170]]))).toEqual([{ members: ["a"], seats: 180 }]);
  });
});
