import { baseById, defaultBase, type Base } from "@/lib/elections/bases";
import { restoreScenario } from "./restore";
import type { Scenario } from "./types";

export type SimulatorInitialState = {
  base: Base;
  scenario: Scenario | null;
  shared: string | null;
  brokenLink: boolean;
};

export function simulatorInitialState(shared: string | null): SimulatorInitialState {
  const scenario = shared ? restoreScenario(shared) : null;
  return {
    base: scenario ? baseById(scenario.baseElectionId) ?? defaultBase : defaultBase,
    scenario,
    shared,
    brokenLink: Boolean(shared) && !scenario,
  };
}
