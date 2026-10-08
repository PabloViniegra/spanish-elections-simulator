import { baseById } from "@/lib/elections/bases";
import { rankedBlocs, scenarioBlocs } from "@/lib/scenario/blocs";
import { restoreScenario } from "@/lib/scenario/restore";
import { simulate } from "@/lib/scenario/simulate";
import { seats2026 } from "@/lib/seats-2026";

// What a saved scenario adds up to: its base election and the blocs with
// seats, largest first. Null if it no longer restores.
export function summarizeSimulation(param: string) {
  const scenario = restoreScenario(param);
  const base = scenario && baseById(scenario.baseElectionId);
  if (!scenario || !base) return null;
  const blocs = scenarioBlocs(scenario, base);
  const { seats } = simulate(scenario, base.election, blocs, seats2026);
  return { baseLabel: base.label, ranked: rankedBlocs(blocs, seats) };
}
