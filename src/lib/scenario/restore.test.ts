import { describe, expect, it } from "vitest";
import { bases } from "@/lib/elections/bases";
import { baselineOf } from "./baselines";
import { restoreScenario } from "./restore";
import { encodeScenario } from "./url";

describe("restoreScenario", () => {
  it("restores a link for every base election", () => {
    for (const base of bases) {
      const scenario = baselineOf(base).scenario;
      expect(restoreScenario(encodeScenario(scenario))).toEqual(scenario);
    }
  });

  it("is null for a broken link or one that fits no base", () => {
    const scenario = baselineOf(bases[0]).scenario;
    expect(restoreScenario("v1.%%%")).toBeNull();
    expect(restoreScenario(encodeScenario({ ...scenario, baseElectionId: "1977-06" }))).toBeNull();
  });
});
