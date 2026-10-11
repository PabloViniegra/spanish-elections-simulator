import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { type BuilderReference, provinceStatus } from "./allocate";
import { MAX_VOTES } from "./schema";
import type { BuiltParty, BuiltProvince, BuiltScenario } from "./types";

const BLANK_PROVINCE: BuiltProvince = { votes: {}, blank: 0, null: 0 };

// A whole number of votes between 0 and MAX_VOTES; anything else is 0.
export function voteCount(value: number) {
  return Number.isFinite(value) ? Math.min(MAX_VOTES, Math.max(0, Math.trunc(value))) : 0;
}

function withProvince(scenario: BuiltScenario, code: string, change: (province: BuiltProvince) => BuiltProvince): BuiltScenario {
  return { ...scenario, provinces: { ...scenario.provinces, [code]: change(scenario.provinces[code] ?? BLANK_PROVINCE) } };
}

// A party joins a province with no votes yet, or leaves it with its votes.
export function setRunning(scenario: BuiltScenario, code: string, partyId: string, running: boolean) {
  return withProvince(scenario, code, (province) => {
    const { [partyId]: _left, ...votes } = province.votes;
    return { ...province, votes: running ? { ...province.votes, [partyId]: province.votes[partyId] ?? 0 } : votes };
  });
}

export function setPartyVotes(scenario: BuiltScenario, code: string, partyId: string, votes: number) {
  return withProvince(scenario, code, (province) => ({ ...province, votes: { ...province.votes, [partyId]: voteCount(votes) } }));
}

export function setOtherVotes(scenario: BuiltScenario, code: string, kind: "blank" | "null", votes: number) {
  return withProvince(scenario, code, (province) => ({ ...province, [kind]: voteCount(votes) }));
}

// The parties of the list that may run in a province: invented ones anywhere,
// catalogue ones only where they once ran.
export function eligibleParties(scenario: BuiltScenario, code: string, reference: BuilderReference): BuiltParty[] {
  return scenario.parties.filter(({ catalogId }) => !catalogId || reference.catalog.get(catalogId)?.provinces.includes(code));
}

// Where to pick up: the first province, from `from` on, that is not complete,
// or `from` itself when every one is.
export function nextOpen(scenario: BuiltScenario, reference: BuilderReference, from = CONSTITUENCY_CODES[0]) {
  const start = Math.max(0, CONSTITUENCY_CODES.indexOf(from));
  const order = [...CONSTITUENCY_CODES.slice(start), ...CONSTITUENCY_CODES.slice(0, start)];
  return order.find((code) => provinceStatus(scenario, code, reference) !== "complete") ?? from;
}
