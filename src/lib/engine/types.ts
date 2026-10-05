// Inputs and outputs of the Congreso seat engine. Votes are integers; the
// engine never divides them, so every comparison is exact.

// A local list as it appeared on the ballot in one constituency (R-08).
export type Candidacy = {
  id: string;
  votes: number;
};

export type ConstituencyVotes = {
  // INE two-digit code; 51 and 52 are Ceuta and Melilla.
  code: string;
  seats: number;
  blankVotes: number;
  candidacies: readonly Candidacy[];
};

// One seat, in the order D'Hondt hands them out. The winning quotient is
// votes / divisor.
export type SeatAward = {
  candidacyId: string;
  votes: number;
  divisor: number;
  decidedByLot: boolean;
};

export type CandidacyResult = Candidacy & {
  // Below the 3% threshold in this constituency (R-05).
  excluded: boolean;
  seats: number;
};

export type ConstituencyResult = {
  code: string;
  seats: number;
  validVotes: number;
  candidacies: CandidacyResult[];
  awards: SeatAward[];
  // Seats left unassigned because no candidacy with votes passed the threshold.
  vacantSeats: number;
};
