import type { ConstituencyResult } from "@/lib/engine/types";
import { rankedBlocs } from "@/lib/scenario/blocs";
import { allocateBuilt, type BuilderReference, partyBlocs, provinceStatus } from "./allocate";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { seatTables } from "./reference";
import { validBuilt } from "./save";
import type { BuiltParty, BuiltScenario } from "./types";

export type NationalRow = BuiltParty & { votes: number; share: number; seats: number };

// Seats each party won across the constituencies.
export function seatTotals(results: readonly ConstituencyResult[]) {
  const seats = new Map<string, number>();
  for (const { candidacies } of results) {
    for (const { id, seats: won } of candidacies) seats.set(id, (seats.get(id) ?? 0) + won);
  }
  return seats;
}

// The national table: each party that got votes or seats, by seats and then
// votes, with its share of the valid vote (blank included, R-05). Blank votes
// go apart, since they never win seats.
export function nationalTotals(scenario: BuiltScenario, results: readonly ConstituencyResult[]) {
  const valid = results.reduce((sum, result) => sum + result.validVotes, 0);
  const votes = new Map<string, number>();
  for (const { candidacies } of results) {
    for (const { id, votes: count } of candidacies) votes.set(id, (votes.get(id) ?? 0) + count);
  }
  const seats = seatTotals(results);
  const share = (count: number) => (valid > 0 ? count / valid : 0);
  const rows: NationalRow[] = scenario.parties
    .map((party) => ({ ...party, votes: votes.get(party.id) ?? 0, seats: seats.get(party.id) ?? 0, share: share(votes.get(party.id) ?? 0) }))
    .filter((row) => row.votes > 0 || row.seats > 0)
    .sort((a, b) => b.seats - a.seats || b.votes - a.votes);
  const blank = Object.values(scenario.provinces).reduce((sum, province) => sum + province.blank, 0);
  return { rows, blank, blankShare: share(blank), valid };
}

// What a saved built election adds up to in the profile: how many provinces
// are complete and, once all are, the parties with seats. Null if it no
// longer reads.
export function summarizeBuilt(json: string, reference: BuilderReference) {
  const scenario = validBuilt(json, reference);
  if (!scenario) return null;
  const completed = CONSTITUENCY_CODES.filter((code) => provinceStatus(scenario, code, reference) === "complete").length;
  const results = allocateBuilt(scenario, seatTables[scenario.seatTable], reference);
  return { completed, ranked: results && rankedBlocs(partyBlocs(scenario), seatTotals(results)) };
}
