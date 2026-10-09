import { decompressFromEncodedURIComponent } from "lz-string";
import * as z from "zod/mini";
import { BLOC_NAME_MAX, MAX_BLOCS } from "./blocs";
import { fitsInFull } from "./simulate";
import { FULL_SHARE, type Scenario } from "./types";
import { SCENARIO_PREFIX } from "./address";

// URL format: "v1." + the scenario as JSON compressed with lz-string (NFR-10).
export { encodeScenario, exceedsShareUrlLimit, SAVED_PARAM, SCENARIO_PARAM, SHARE_URL_LIMIT, simulatorHref, withScenarioParam } from "./address";

const share = z.int().check(z.gte(0), z.lte(FULL_SHARE));
const bloc = z.object({
  id: z.string().check(z.regex(/^[a-z0-9-]{1,16}$/)),
  name: z.string().check(z.refine((name) => name.trim().length > 0 && name.length <= BLOC_NAME_MAX)),
  colour: z.string().check(z.regex(/^#[0-9a-f]{6}$/i)),
  candidacyIds: z.array(z.string()),
});
const scenarioSchema = z.object({
  schemaVersion: z.literal(1),
  baseElectionId: z.string(),
  shares: z.record(z.string(), share),
  blank: share,
  turnout: z.nullable(share),
  provinces: z.optional(z.record(z.string(), z.object({ shares: z.record(z.string(), share), blank: share }))),
  blocs: z.optional(z.array(bloc).check(z.minLength(1), z.maxLength(MAX_BLOCS))),
});

// The scenario a link carries, or null when it is broken or from another
// schema version. Decompressing is the costly step, so it runs once per link.
export function parseScenarioParam(param: string): Scenario | null {
  if (!param.startsWith(SCENARIO_PREFIX)) return null;
  const json = decompressFromEncodedURIComponent(param.slice(SCENARIO_PREFIX.length));
  if (!json) return null;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  const parsed = scenarioSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

// Whether a parsed scenario fits the base scenario: same election, no unknown
// bloc, shares within 100%, no unknown province, and a bloc list that neither
// repeats an id or a candidacy nor names one the election does not have.
export function fitsBase(
  scenario: Scenario,
  base: Scenario,
  provinceCodes: ReadonlySet<string>,
  candidacyIds: ReadonlySet<string>,
) {
  const blocIds = scenario.blocs ? new Set(scenario.blocs.map(({ id }) => id)) : new Set(Object.keys(base.shares));
  const mapped = scenario.blocs?.flatMap((bloc) => bloc.candidacyIds) ?? [];
  const blocsFit =
    blocIds.size === (scenario.blocs ?? Object.keys(base.shares)).length &&
    new Set(mapped).size === mapped.length &&
    mapped.every((id) => candidacyIds.has(id));
  const knownBlocs = ({ shares }: { shares: Record<string, number> }) => Object.keys(shares).every((blocId) => blocIds.has(blocId));
  const provinces = Object.entries(scenario.provinces ?? {});
  return (
    scenario.baseElectionId === base.baseElectionId &&
    blocsFit &&
    knownBlocs(scenario) &&
    provinces.every(([code, province]) => provinceCodes.has(code) && knownBlocs(province)) &&
    fitsInFull(scenario)
  );
}

// The shared scenario, or null when the link is broken or does not fit the base.
export function decodeScenario(
  param: string,
  base: Scenario,
  provinceCodes: ReadonlySet<string>,
  candidacyIds: ReadonlySet<string>,
): Scenario | null {
  const scenario = parseScenarioParam(param);
  return scenario && fitsBase(scenario, base, provinceCodes, candidacyIds) ? scenario : null;
}
