import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { type BaseProvince, projectShares, RAKING_TOLERANCE } from "./project";

const base: BaseProvince[] = [
  { code: "01", votes: new Map([["A", 600], ["B", 300], ["R", 0], ["blank", 100]]) },
  { code: "02", votes: new Map([["A", 200], ["B", 500], ["R", 200], ["blank", 100]]) },
  { code: "03", votes: new Map([["A", 400], ["B", 400], ["R", 0], ["blank", 200]]) },
];

const baseShares = new Map([["A", 0.4], ["B", 0.4], ["R", 0.2 / 3], ["blank", 0.4 / 3]]);

function expectNear(actual: ReadonlyMap<string, number>, expected: ReadonlyMap<string, number>) {
  expected.forEach((share, key) => expect(actual.get(key)).toBeCloseTo(share, 6));
}

describe("projectShares (P-01 to P-05)", () => {
  it("returns the base shares when every target equals the base share", () => {
    const projection = projectShares(base, baseShares);
    expect(projection.converged).toBe(true);
    expectNear(projection.provinces.get("02")!, new Map([["A", 0.2], ["B", 0.5], ["R", 0.2], ["blank", 0.1]]));
  });

  it("swings every province in proportion and matches the national targets", () => {
    const shares = new Map([["A", 0.3], ["B", 0.5], ["R", 0.05], ["blank", 0.15]]);
    const projection = projectShares(base, shares);
    expect(projection.converged).toBe(true);
    shares.forEach((target, key) =>
      expect(Math.abs(projection.national.get(key)! - target)).toBeLessThanOrEqual(RAKING_TOLERANCE),
    );
    const a = [...projection.provinces.values()].map((province) => province.get("A")!);
    expect(a[0]).toBeGreaterThan(a[2]);
    expect(a[2]).toBeGreaterThan(a[1]);
  });

  it("keeps a regional bloc at zero outside its provinces (P-05)", () => {
    const projection = projectShares(base, new Map([["A", 0.4], ["B", 0.4], ["R", 0.1], ["blank", 0.1]]));
    expect(projection.provinces.get("01")!.get("R")).toBe(0);
    expect(projection.provinces.get("02")!.get("R")).toBeCloseTo(0.3, 4);
  });

  it("reports the share reached when a target cannot be met", () => {
    const projection = projectShares(base, new Map([["A", 0.2], ["B", 0.2], ["R", 0.5], ["blank", 0.1]]));
    expect(projection.converged).toBe(false);
    expect(projection.national.get("R")).toBeLessThan(1 / 3 + 1e-9);
  });

  it("spreads a new bloc evenly (P-04)", () => {
    const shares = new Map([["A", 0.35], ["B", 0.35], ["R", 0.05], ["blank", 0.1], ["N", 0.15]]);
    projectShares(base, shares).provinces.forEach((province) => expect(province.get("N")).toBeCloseTo(0.15, 2));
  });

  it("drops a bloc set to zero everywhere", () => {
    const projection = projectShares(base, new Map([["A", 0.6], ["B", 0.3], ["R", 0], ["blank", 0.1]]));
    projection.provinces.forEach((province) => expect(province.get("R")).toBe(0));
  });

  it("keeps locked provinces and rakes the rest to the national targets (P-07)", () => {
    const fixed = new Map([["A", 0.1], ["B", 0.8], ["R", 0], ["blank", 0.1]]);
    const projection = projectShares(base, baseShares, new Map([["01", fixed]]));
    expect(projection.converged).toBe(true);
    expect(projection.provinces.get("01")).toEqual(fixed);
    baseShares.forEach((target, key) =>
      expect(Math.abs(projection.national.get(key)! - target)).toBeLessThanOrEqual(RAKING_TOLERANCE),
    );
    expect(projection.provinces.get("03")!.get("A")).toBeGreaterThan(0.4);
  });

  it("keeps locked provinces and reports the shortfall when the rest cannot make up the target", () => {
    const fixed = new Map([["A", 1], ["B", 0], ["R", 0], ["blank", 0]]);
    const locked = new Map([["01", fixed], ["03", fixed]]);
    const projection = projectShares(base, new Map([["A", 0.2], ["B", 0.5], ["R", 0.2], ["blank", 0.1]]), locked);
    expect(projection.converged).toBe(false);
    expect(projection.provinces.get("01")).toEqual(fixed);
    expect(projection.national.get("A")).toBeCloseTo(2 / 3, 6);
    expect(projection.provinces.get("02")!.get("A")).toBe(0);
  });

  it("rejects targets that do not add up to 100% and empty bases", () => {
    expect(() => projectShares(base, new Map([["A", 0.5]]))).toThrow(RangeError);
    expect(() => projectShares([{ code: "01", votes: new Map([["A", 0]]) }], new Map([["A", 1]]))).toThrow(
      RangeError,
    );
  });

  it("always returns provincial shares that add up to 1 (property)", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 4, maxLength: 4 }), (weights) => {
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        const keys = ["A", "B", "R", "blank"];
        const shares = new Map(keys.map((key, index) => [key, weights[index] / total]));
        projectShares(base, shares).provinces.forEach((province) =>
          expect([...province.values()].reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 9),
        );
      }),
    );
  });
});
