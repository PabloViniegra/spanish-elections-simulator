import { bases } from "@/lib/elections/bases";
import { provinces } from "@/lib/provinces";
import { baselineOf } from "./baselines";
import { fitsBase, parseScenarioParam } from "./url";

const provinceCodes = new Set(provinces.map(({ code }) => code));

// A shared link fits the base election it names, or none (FR-01, FR-10).
export function restoreScenario(param: string) {
  const scenario = parseScenarioParam(param);
  if (!scenario) return null;
  const fits = bases.some((base) =>
    fitsBase(scenario, baselineOf(base).scenario, provinceCodes, new Set(base.election.candidacies.map(({ id }) => id))),
  );
  return fits ? scenario : null;
}
