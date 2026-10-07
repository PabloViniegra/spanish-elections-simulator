import type { Base } from "@/lib/elections/bases";
import { seats2026 } from "@/lib/seats-2026";
import { baseScenario, othersShare, simulate } from "./simulate";

const cache = new Map<string, ReturnType<typeof build>>();

function build({ election, blocs }: Base) {
  const scenario = baseScenario(election, blocs);
  return { scenario, others: othersShare(scenario), simulation: simulate(scenario, election, blocs, seats2026) };
}

// A base election as an untouched scenario, with its simulation on the 2026
// seats. Built once per base, so the same base always gives the same objects.
export function baselineOf(base: Base) {
  const id = base.election.id;
  if (!cache.has(id)) cache.set(id, build(base));
  return cache.get(id)!;
}
