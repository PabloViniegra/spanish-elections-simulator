import { describe, expect, it } from "vitest";
import { DESIGNATED_SENATORS, ELECTED_SENATORS, TOTAL_SENATORS, constituency, designated, designatedFor, marksAllowed, seatSplit } from "./senate";

describe("senate", () => {
  it("elects 208 senators and appoints 58 in the XV legislature", () => {
    expect(ELECTED_SENATORS).toBe(208);
    expect(DESIGNATED_SENATORS).toBe(58);
    expect(TOTAL_SENATORS).toBe(266);
    expect(designated).toHaveLength(17);
  });

  it("gives each community one senator plus one per million inhabitants", () => {
    expect(designatedFor(316_000)).toBe(1);
    expect(designatedFor(999_999)).toBe(1);
    expect(designatedFor(1_000_000)).toBe(2);
    expect(designatedFor(8_500_000)).toBe(9);
  });

  it("limits the marks to one fewer than the seats where four or three are elected", () => {
    expect(marksAllowed(4)).toBe(3);
    expect(marksAllowed(3)).toBe(2);
    expect(marksAllowed(2)).toBe(2);
    expect(marksAllowed(1)).toBe(1);
  });

  it("splits Madrid 3-1 and Valencia 2-2 in 2023", () => {
    expect(seatSplit(constituency("289"))).toEqual([3, 1]);
    expect(seatSplit(constituency("469"))).toEqual([2, 2]);
  });

  it("rejects an unknown constituency", () => {
    expect(() => constituency("999")).toThrow();
  });
});
