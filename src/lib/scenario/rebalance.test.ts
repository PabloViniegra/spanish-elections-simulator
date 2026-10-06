import { describe, expect, it } from "vitest";
import { rebalance } from "./rebalance";
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
});
