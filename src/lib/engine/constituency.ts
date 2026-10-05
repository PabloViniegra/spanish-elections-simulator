import { dhondt } from "./dhondt";
import { passesThreshold, validVotes } from "./threshold";
import type { ConstituencyResult, ConstituencyVotes } from "./types";

// Allocates one constituency: threshold (R-04, R-05), then D'Hondt with tie
// rules (R-06, R-07). Single-seat constituencies need no special case (R-09).
export function allocateConstituency(constituency: ConstituencyVotes, lotSeed: string): ConstituencyResult {
  assertVotes(constituency);
  const valid = validVotes(constituency);
  const eligible = constituency.candidacies.filter((candidacy) => passesThreshold(candidacy.votes, valid));
  const { awards, vacantSeats } = dhondt(eligible, constituency.seats, `${lotSeed}:${constituency.code}`);

  const seatsById = new Map<string, number>();
  awards.forEach(({ candidacyId }) => seatsById.set(candidacyId, (seatsById.get(candidacyId) ?? 0) + 1));

  return {
    code: constituency.code,
    seats: constituency.seats,
    validVotes: valid,
    candidacies: constituency.candidacies.map((candidacy) => ({
      ...candidacy,
      excluded: !eligible.includes(candidacy),
      seats: seatsById.get(candidacy.id) ?? 0,
    })),
    awards,
    vacantSeats,
  };
}

function assertVotes({ code, seats, blankVotes, candidacies }: ConstituencyVotes) {
  if (!Number.isSafeInteger(seats) || seats < 1) {
    throw new RangeError(`Constituency ${code} needs a positive whole number of seats`);
  }
  const counts = [blankVotes, ...candidacies.map((candidacy) => candidacy.votes)];
  if (counts.some((votes) => !Number.isSafeInteger(votes) || votes < 0)) {
    throw new RangeError(`Votes in constituency ${code} must be non-negative integers`);
  }
  if (new Set(candidacies.map((candidacy) => candidacy.id)).size !== candidacies.length) {
    throw new RangeError(`Candidacy ids repeat in constituency ${code}`);
  }
}
