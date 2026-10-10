import type { Base } from "@/lib/elections/bases";
import type { Bloc } from "@/lib/elections/types";
import { simulationSeats } from "@/lib/elections/current";
import { baseScenario, othersShare, simulate } from "./simulate";

const cache = new Map<string, ReturnType<typeof build>>();

function build({ election, blocs: defaults }: Base, blocs = defaults) {
  const plain = baseScenario(election, blocs);
  const scenario = blocs === defaults ? plain : { ...plain, blocs: [...blocs] };
  return { scenario, others: othersShare(scenario), simulation: simulate(scenario, election, blocs, simulationSeats) };
}

// A base election as an untouched scenario, with its simulation on the 2026
// seats. Built once per base, so the same base always gives the same objects.
export function baselineOf(base: Base) {
  const id = base.election.id;
  if (!cache.has(id)) cache.set(id, build(base));
  return cache.get(id)!;
}

// The base election under the blocs the user edited (FR-11), which carries
// them, so seat changes and resets keep the mapping.
export function baselineFor(base: Base, blocs: readonly Bloc[]) {
  return blocs === base.blocs ? baselineOf(base) : build(base, blocs);
}
