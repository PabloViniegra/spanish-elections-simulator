import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import * as z from "zod/mini";
import { BLOC_NAME_MAX, MAX_BLOCS } from "./blocs";
import { fitsInFull } from "./simulate";
import { FULL_SHARE, type Scenario } from "./types";

// URL format: "v1." + the scenario as JSON compressed with lz-string (NFR-10).
// A later schema bumps the prefix and migrates older links here.
const PREFIX = "v1.";
export const SCENARIO_PARAM = "e";
export const SHARE_URL_LIMIT = 2000;

// The simulator opened on an encoded scenario.
export const simulatorHref = (param: string) => `/simulator?${SCENARIO_PARAM}=${encodeURIComponent(param)}`;

export function withScenarioParam(currentHref: string, scenarioParam: string | null) {
  const url = new URL(currentHref);
  if (scenarioParam) url.searchParams.set(SCENARIO_PARAM, scenarioParam);
  else url.searchParams.delete(SCENARIO_PARAM);
  return url.href;
}

export function exceedsShareUrlLimit(href: string) {
  return href.length > SHARE_URL_LIMIT;
}

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

export function encodeScenario(scenario: Scenario) {
  return PREFIX + compressToEncodedURIComponent(JSON.stringify(scenario));
}

// The shared scenario, or null when the link is broken, from another schema
// version, or does not fit the base scenario (other election, unknown bloc,
// shares over 100%, unknown province, a bloc list that repeats an id or a
// candidacy, or names one the election does not have).
export function decodeScenario(
  param: string,
  base: Scenario,
  provinceCodes: ReadonlySet<string>,
  candidacyIds: ReadonlySet<string>,
): Scenario | null {
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
  const blocIds = scenario.blocs ? new Set(scenario.blocs.map(({ id }) => id)) : new Set(Object.keys(base.shares));
  const mapped = scenario.blocs?.flatMap((bloc) => bloc.candidacyIds) ?? [];
  const blocsFit =
    blocIds.size === (scenario.blocs ?? Object.keys(base.shares)).length &&
    new Set(mapped).size === mapped.length &&
    mapped.every((id) => candidacyIds.has(id));
  const knownBlocs = ({ shares }: { shares: Record<string, number> }) => Object.keys(shares).every((blocId) => blocIds.has(blocId));
  const provinces = Object.entries(scenario.provinces ?? {});
  const fits =
    scenario.baseElectionId === base.baseElectionId &&
    blocsFit &&
    knownBlocs(scenario) &&
    provinces.every(([code, province]) => provinceCodes.has(code) && knownBlocs(province)) &&
    fitsInFull(scenario);
  return fits ? scenario : null;
}
