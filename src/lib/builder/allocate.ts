import type { Bloc } from "@/lib/elections/types";
import { allocateCongreso } from "@/lib/engine/congreso";
import { allocateConstituency } from "@/lib/engine/constituency";
import type { ConstituencyResult, ConstituencyVotes } from "@/lib/engine/types";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import type { BuiltProvince, BuiltScenario, CatalogParty, ProvinceStatus } from "./types";

// Seeds the R-07 draws, so the same votes always give the same seats.
const LOT_SEED = "builder";

export type BuilderReference = {
  census: ReadonlyMap<string, number>;
  // Catalogue parties by id, to keep each one where it has run.
  catalog: ReadonlyMap<string, CatalogParty>;
};

// Every vote cast in a province: parties, blank and null.
export function castVotes(province: BuiltProvince) {
  return Object.values(province.votes).reduce((sum, count) => sum + count, province.blank + province.null);
}

// Whether a province counts towards the Congreso: started, with votes for at
// least one party, within its census, and no catalogue party outside its
// territory.
export function provinceStatus(scenario: BuiltScenario, code: string, reference: BuilderReference): ProvinceStatus {
  const province = scenario.provinces[code];
  if (!province) return "empty";
  const outside = scenario.parties.some(
    ({ id, catalogId }) => id in province.votes && catalogId && !reference.catalog.get(catalogId)?.provinces.includes(code),
  );
  if (outside) return "invalid-party";
  if (castVotes(province) > (reference.census.get(code) ?? 0)) return "over-census";
  return Object.values(province.votes).some((count) => count > 0) ? "complete" : "incomplete";
}

// One province as the engine sees it: the parties running, in list order.
// Null votes never reach the engine (R-04).
function constituencyVotes(scenario: BuiltScenario, code: string, seats: ReadonlyMap<string, number>): ConstituencyVotes {
  const province = scenario.provinces[code] ?? { votes: {}, blank: 0, null: 0 };
  return {
    code,
    seats: seats.get(code) ?? 0,
    blankVotes: province.blank,
    candidacies: scenario.parties.filter(({ id }) => id in province.votes).map(({ id }) => ({ id, votes: province.votes[id] })),
  };
}

// The live seat split of one province while the user fills it in.
export function allocateProvince(scenario: BuiltScenario, code: string, seats: ReadonlyMap<string, number>) {
  return allocateConstituency(constituencyVotes(scenario, code, seats), LOT_SEED);
}

// True once all 52 constituencies are complete.
export function isComplete(scenario: BuiltScenario, reference: BuilderReference) {
  return CONSTITUENCY_CODES.every((code) => provinceStatus(scenario, code, reference) === "complete");
}

// The whole Congreso, or null until all 52 constituencies are complete.
export function allocateBuilt(
  scenario: BuiltScenario,
  seats: ReadonlyMap<string, number>,
  reference: BuilderReference,
): ConstituencyResult[] | null {
  if (!isComplete(scenario, reference)) return null;
  return allocateCongreso(
    CONSTITUENCY_CODES.map((code) => constituencyVotes(scenario, code, seats)),
    LOT_SEED,
  );
}

// Each party as a one-candidacy bloc, the shape the simulator's views take.
export function partyBlocs(scenario: BuiltScenario): Bloc[] {
  return scenario.parties.map(({ id, name, colour }) => ({ id, name, colour, candidacyIds: [id] }));
}
