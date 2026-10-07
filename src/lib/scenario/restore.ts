import { bases } from "@/lib/elections/bases";
import { provinces } from "@/lib/provinces";
import { baselineOf } from "./baselines";
import { decodeScenario } from "./url";

const provinceCodes = new Set(provinces.map(({ code }) => code));

// A shared link fits the base election it names, or none (FR-01, FR-10).
export function restoreScenario(param: string) {
  return bases.map((base) => decodeScenario(param, baselineOf(base).scenario, provinceCodes)).find(Boolean) ?? null;
}
