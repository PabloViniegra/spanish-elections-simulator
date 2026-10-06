import { allocateCongreso } from "@/lib/engine/congreso";
import type { ConstituencyVotes } from "@/lib/engine/types";
import type { Election } from "./types";

export function constituencyVotes(election: Election): ConstituencyVotes[] {
  return election.constituencies.map(({ code, seats, blankVotes, results }) => ({
    code,
    seats,
    blankVotes,
    candidacies: results.map(({ candidacyId, votes }) => ({ id: candidacyId, votes })),
  }));
}

// NFR-01: runs the engine on the official votes and lists every constituency
// where its seats differ from the official count. Empty means seat for seat.
export function officialSeatMismatches(election: Election) {
  const results = new Map(
    allocateCongreso(constituencyVotes(election), election.id).map((result) => [result.code, result]),
  );
  return election.constituencies.flatMap((constituency) => {
    const computed = results.get(constituency.code);
    const differs = constituency.results.some(
      ({ candidacyId, elected }) =>
        computed?.candidacies.find((candidacy) => candidacy.id === candidacyId)?.seats !== elected,
    );
    return differs || computed?.vacantSeats !== 0 ? [constituency.code] : [];
  });
}
