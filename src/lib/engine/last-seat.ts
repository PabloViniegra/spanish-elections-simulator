import type { ConstituencyResult } from "./types";

export type QuotientCell = {
  divisor: number;
  quotient: number;
  // Position in the seat order (1 = first seat), or null when it won none.
  seat: number | null;
  // R-07: the seat went to this quotient by lot (NFR-04).
  decidedByLot: boolean;
};

export type QuotientRow = {
  candidacyId: string;
  votes: number;
  seats: number;
  quotients: QuotientCell[];
};

// FR-09: how one constituency's seats were decided. The table runs to one
// divisor past the most seats any candidacy won, so every winning quotient and
// the next one in line show. Candidacies below the 3% threshold (R-05) never
// compete and are left out.
export function dhondtDetail(result: ConstituencyResult) {
  const seatOf = new Map(result.awards.map((award, index) => [`${award.candidacyId}:${award.divisor}`, { ...award, seat: index + 1 }]));
  const contenders = result.candidacies
    .filter((candidacy) => !candidacy.excluded && candidacy.votes > 0)
    .sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id));
  const columns = Math.max(0, ...contenders.map((candidacy) => candidacy.seats)) + 1;
  const rows: QuotientRow[] = contenders.map(({ id, votes, seats }) => ({
    candidacyId: id,
    votes,
    seats,
    quotients: Array.from({ length: columns }, (_, index) => {
      const award = seatOf.get(`${id}:${index + 1}`);
      return { divisor: index + 1, quotient: votes / (index + 1), seat: award?.seat ?? null, decidedByLot: award?.decidedByLot ?? false };
    }),
  }));

  const last = result.awards.at(-1);
  const lastSeat = last && { ...last, quotient: last.votes / last.divisor };
  // The best quotient left without a seat among the other candidacies: the one
  // that would take the last seat with enough extra votes.
  const runnerUp = contenders
    .filter((candidacy) => candidacy.id !== last?.candidacyId)
    .map(({ id, votes, seats }) => ({ candidacyId: id, votes, divisor: seats + 1 }))
    .reduce<{ candidacyId: string; votes: number; divisor: number } | null>(
      (best, candidacy) => (!best || candidacy.votes * best.divisor > best.votes * candidacy.divisor ? candidacy : best),
      null,
    );

  return {
    rows,
    lastSeat: lastSeat ?? null,
    runnerUp:
      runnerUp && last
        ? { ...runnerUp, quotient: runnerUp.votes / runnerUp.divisor, votesToFlip: votesToBeat(last, runnerUp) }
        : null,
  };
}

// Extra votes the challenger needs for its next quotient to beat the last
// seat's (R-06), or to tie it with more total votes (R-07). Integer
// arithmetic, as in the engine.
function votesToBeat(last: { votes: number; divisor: number }, challenger: { votes: number; divisor: number }) {
  const target = last.votes * challenger.divisor;
  const floor = Math.floor(target / last.divisor);
  const needed = floor * last.divisor === target && floor > last.votes ? floor : floor + 1;
  return Math.max(0, needed - challenger.votes);
}
