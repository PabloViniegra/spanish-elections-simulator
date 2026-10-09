import { describe, expect, it } from "vitest";
import { bases, defaultBase } from "@/lib/elections/bases";
import { baselineOf } from "./baselines";
import { simulatorInitialState } from "./initial";
import { encodeScenario } from "./url";

describe("simulatorInitialState", () => {
  it("starts on the default election without a shared scenario", () => {
    expect(simulatorInitialState(null)).toEqual({ base: defaultBase, scenario: null, shared: null, brokenLink: false });
  });

  it.each(bases)("restores the election carried by a shared link: $election.id", (base) => {
    const scenario = baselineOf(base).scenario;
    const shared = encodeScenario(scenario);
    expect(simulatorInitialState(shared)).toEqual({ base, scenario, shared, brokenLink: false });
  });

  it("keeps the broken-link warning while falling back to the default election", () => {
    expect(simulatorInitialState("broken")).toEqual({ base: defaultBase, scenario: null, shared: "broken", brokenLink: true });
  });
});
