import * as z from "zod/mini";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import type { BuiltScenario } from "./types";

// Parties in one scenario, so the chamber and its legend stay legible.
export const MAX_PARTIES = 24;
export const PARTY_NAME_MAX = 40;
// Above the census of any constituency, so a typo cannot overflow the engine.
export const MAX_VOTES = 10_000_000;
// The longest stored scenario: 52 provinces with every party running.
export const BUILT_SCENARIO_MAX = 100_000;

const count = z.int().check(z.gte(0), z.lte(MAX_VOTES));
const party = z.object({
  id: z.string().check(z.regex(/^[a-z0-9-]{1,40}$/)),
  name: z.string().check(z.refine((name) => name.trim().length > 0 && name.length <= PARTY_NAME_MAX)),
  colour: z.string().check(z.regex(/^#[0-9a-f]{6}$/i)),
  catalogId: z.optional(z.string().check(z.regex(/^[a-z0-9-]{1,40}$/))),
});
const schema = z.object({
  schemaVersion: z.literal(1),
  seatTable: z.enum(["2023", "2026"]),
  parties: z.array(party).check(z.maxLength(MAX_PARTIES)),
  provinces: z.record(z.string(), z.object({ votes: z.record(z.string(), count), blank: count, null: count })),
});

const codes = new Set(CONSTITUENCY_CODES);

// The stored scenario, or null when it is broken, from another schema
// version, repeats a party, or names a province or party it does not have.
export function parseBuiltScenario(json: string): BuiltScenario | null {
  if (json.length > BUILT_SCENARIO_MAX) return null;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  const parsed = schema.safeParse(data);
  return parsed.success && fits(parsed.data) ? parsed.data : null;
}

function fits({ parties, provinces }: BuiltScenario) {
  const ids = new Set(parties.map(({ id }) => id));
  const catalogIds = parties.flatMap(({ catalogId }) => (catalogId ? [catalogId] : []));
  return (
    ids.size === parties.length &&
    new Set(catalogIds).size === catalogIds.length &&
    Object.entries(provinces).every(([code, { votes }]) => codes.has(code) && Object.keys(votes).every((id) => ids.has(id)))
  );
}
