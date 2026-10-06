import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { z } from "zod";
import { othersShare } from "./simulate";
import { FULL_SHARE, type Scenario } from "./types";

// URL format: "v1." + the scenario as JSON compressed with lz-string (NFR-10).
// A later schema bumps the prefix and migrates older links here.
const PREFIX = "v1.";
export const SCENARIO_PARAM = "e";

const share = z.number().int().min(0).max(FULL_SHARE);
const scenarioSchema = z.object({
  schemaVersion: z.literal(1),
  baseElectionId: z.string(),
  shares: z.record(z.string(), share),
  blank: share,
  turnout: share.nullable(),
});

export function encodeScenario(scenario: Scenario) {
  return PREFIX + compressToEncodedURIComponent(JSON.stringify(scenario));
}

// The shared scenario, or null when the link is broken, from another schema
// version, or does not fit the base scenario (other election, unknown bloc,
// shares over 100%).
export function decodeScenario(param: string, base: Scenario): Scenario | null {
  if (!param.startsWith(PREFIX)) return null;
  const json = decompressFromEncodedURIComponent(param.slice(PREFIX.length));
  if (!json) return null;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  const parsed = scenarioSchema.safeParse(data);
  if (!parsed.success) return null;
  const scenario = parsed.data;
  const fits =
    scenario.baseElectionId === base.baseElectionId &&
    Object.keys(scenario.shares).every((blocId) => Object.hasOwn(base.shares, blocId)) &&
    othersShare(scenario) >= 0;
  return fits ? scenario : null;
}
