import { describe, expect, it } from "vitest";
import { adjustBlank, adjustShare, rebalance } from "./rebalance";
import { othersShare } from "./simulate";
import type { Scenario } from "./types";

const scenario = (shares: Record<string, number>, blank = 100): Scenario => ({
  schemaVersion: 1,
  baseElectionId: "test",
  shares,
  blank,
  turnout: null,
});

describe("rebalance", () => {
  it("brings an over-budget scenario back to the requested others share", () => {
    const result = rebalance(scenario({ a: 6000, b: 4000, c: 3000 }), 200);
    expect(othersShare(result)).toBe(200);
  });

  it("keeps the proportions between blocs", () => {
    const result = rebalance(scenario({ a: 6000, b: 3000 }, 0), 0);
    expect(result.shares).toEqual({ a: 6667, b: 3333 });
  });

  it("leaves the blank vote and the turnout alone", () => {
    const result = rebalance(scenario({ a: 9000, b: 9000 }, 300), 0);
    expect(result.blank).toBe(300);
    expect(result.turnout).toBeNull();
  });

  it("returns the scenario as is when no bloc has votes", () => {
    const empty = scenario({ a: 0, b: 0 });
    expect(rebalance(empty, 0)).toBe(empty);
  });

  it("keeps a fixed bloc and scales the rest around it", () => {
    const result = rebalance(scenario({ a: 4000, b: 4000, c: 2000 }, 0), 0, "a");
    expect(result.shares).toEqual({ a: 4000, b: 4000, c: 2000 });
    const over = rebalance(scenario({ a: 5000, b: 4000, c: 2000 }, 0), 0, "a");
    expect(over.shares).toEqual({ a: 5000, b: 3334, c: 1666 });
  });
});

describe("adjustShare", () => {
  const base = scenario({ a: 3000, b: 3000, c: 30 }, 100);

  it("keeps the edited value and the others share", () => {
    const result = adjustShare(base, "a", 4000);
    expect(result.shares.a).toBe(4000);
    expect(othersShare(result)).toBe(othersShare(base));
  });

  it("returns to the base when the value goes back", () => {
    expect(adjustShare(base, "a", 3000).shares).toEqual(base.shares);
  });

  it("caps the edited bloc at what the blank vote leaves", () => {
    const result = adjustShare(base, "a", 10_000);
    expect(result.shares).toEqual({ a: 9900, b: 0, c: 0 });
    expect(othersShare(result)).toBe(0);
  });
});

describe("adjustBlank", () => {
  it("scales every bloc and keeps the others share", () => {
    const base = scenario({ a: 6000, b: 3000 }, 500);
    const result = adjustBlank(base, 800);
    expect(result.blank).toBe(800);
    expect(othersShare(result)).toBe(othersShare(base));
  });
});
