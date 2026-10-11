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

// The list grown by one party, which runs in this province from then on.
export function addPartyHere(scenario: BuiltScenario, code: string, parties: BuiltParty[]): BuiltScenario {
  const added = parties.find(({ id }) => !scenario.parties.some((party) => party.id === id));
  const next = { ...scenario, parties };
  return added ? setRunning(next, code, added.id, true) : next;
}

// What a party of the list got in a province in the census election, when it ran there.
export function latestVotes(party: BuiltParty, reference: BuilderReference, latest: BuiltProvince | undefined) {
  const id = party.catalogId && reference.catalog.get(party.catalogId)?.id;
  return id ? latest?.votes[id] : undefined;
}

// A province the user has not started yet, with the parties of the list that
// ran there in the census election running and no votes.
export function startProvince(scenario: BuiltScenario, code: string, reference: BuilderReference, latest: BuiltProvince | undefined): BuiltScenario {
  if (scenario.provinces[code]) return scenario;
  const ran = eligibleParties(scenario, code, reference).filter((party) => latestVotes(party, reference, latest) !== undefined);
  return withProvince(scenario, code, () => ({ ...BLANK_PROVINCE, votes: Object.fromEntries(ran.map(({ id }) => [id, 0])) }));
}

// Empty boxes take the census election: the votes of the running parties that
// ran then, and blank and null votes. Typed votes stay.
export function fillFromLatest(scenario: BuiltScenario, code: string, reference: BuilderReference, latest: BuiltProvince | undefined): BuiltScenario {
  if (!latest) return scenario;
  return withProvince(scenario, code, (province) => {
    const votes = { ...province.votes };
    scenario.parties.forEach((party) => {
      const previous = latestVotes(party, reference, latest);
      if (party.id in votes && votes[party.id] === 0 && previous !== undefined) votes[party.id] = previous;
    });
    return { votes, blank: province.blank || latest.blank, null: province.null || latest.null };
  });
}

// Where to pick up: the first province, from `from` on, that is not complete,
// or `from` itself when every one is.
export function nextOpen(scenario: BuiltScenario, reference: BuilderReference, from = CONSTITUENCY_CODES[0]) {
  const start = Math.max(0, CONSTITUENCY_CODES.indexOf(from));
  const order = [...CONSTITUENCY_CODES.slice(start), ...CONSTITUENCY_CODES.slice(0, start)];
  return order.find((code) => provinceStatus(scenario, code, reference) !== "complete") ?? from;
}
