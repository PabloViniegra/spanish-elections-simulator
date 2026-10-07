import { baseById } from "@/lib/elections/bases";
import { restoreScenario } from "@/lib/scenario/restore";
import { simulate } from "@/lib/scenario/simulate";
import { seats2026 } from "@/lib/seats-2026";

// What a saved scenario adds up to: its base election and the blocs with
// seats, largest first. Null if it no longer restores.
export function summarizeSimulation(param: string) {
  const scenario = restoreScenario(param);
  const base = scenario && baseById(scenario.baseElectionId);
  if (!scenario || !base) return null;
  const { seats } = simulate(scenario, base.election, base.blocs, seats2026);
  const ranked = base.blocs
    .map((bloc) => ({ ...bloc, seats: seats.get(bloc.id) ?? 0 }))
    .filter((bloc) => bloc.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  return { baseLabel: base.label, ranked };
}
