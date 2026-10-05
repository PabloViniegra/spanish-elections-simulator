import type { ConstituencyVotes } from "./types";

export const THRESHOLD_PERCENT = 3;

// R-04: valid votes are votes for candidacies plus blank votes; null votes
// never reach the engine.
export function validVotes(constituency: ConstituencyVotes) {
  return constituency.candidacies.reduce((sum, candidacy) => sum + candidacy.votes, constituency.blankVotes);
}

// R-05: at least 3% of the constituency's valid votes, so exactly 3% passes.
export function passesThreshold(votes: number, valid: number) {
  return votes * 100 >= valid * THRESHOLD_PERCENT;
}
