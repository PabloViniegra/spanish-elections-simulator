import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { baselineOf } from "@/lib/scenario/baselines";
import { encodeScenario } from "@/lib/scenario/url";
import { summarizeSimulation } from "./summary";

describe("summarizeSimulation", () => {
  it("ranks the blocs of a saved scenario by seats", () => {
    const summary = summarizeSimulation(encodeScenario(baselineOf(defaultBase).scenario))!;
    expect(summary.baseLabel).toBe(defaultBase.label);
    expect(summary.ranked.reduce((sum, bloc) => sum + bloc.seats, 0)).toBe(TOTAL_SEATS);
    expect(summary.ranked.map((bloc) => bloc.seats)).toEqual(summary.ranked.map((bloc) => bloc.seats).toSorted((a, b) => b - a));
  });

  it("is null for a scenario that no longer restores", () => {
    expect(summarizeSimulation("v0.roto")).toBeNull();
  });
});
