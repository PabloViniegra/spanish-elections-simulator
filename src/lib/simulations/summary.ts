import { baseById } from "@/lib/elections/bases";
import { rankedBlocs, scenarioBlocs } from "@/lib/scenario/blocs";
import { restoreScenario } from "@/lib/scenario/restore";
import { simulate } from "@/lib/scenario/simulate";
import { simulationSeats } from "@/lib/elections/current";

// What a saved scenario adds up to: its base election and the blocs with
// seats, largest first. Null if it no longer restores.
export function summarizeSimulation(param: string) {
  const scenario = restoreScenario(param);
  const base = scenario && baseById(scenario.baseElectionId);
  if (!scenario || !base) return null;
  const blocs = scenarioBlocs(scenario, base);
  const { seats } = simulate(scenario, base.election, blocs, simulationSeats);
  return { baseLabel: base.label, ranked: rankedBlocs(blocs, seats) };
}
