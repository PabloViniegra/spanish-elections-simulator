import type { Bloc } from "@/lib/elections/types";

// Everything the user changed, and the only thing shared in the URL. Shares
// are basis points (0.01%) of national valid votes; "Others" (P-08) is what
// the blocs and blank votes leave of 100%.
export type Scenario = {
  schemaVersion: 1;
  baseElectionId: string;
  shares: Record<string, number>;
  blank: number;
  // Votes cast over census in basis points; null keeps the base turnout (P-06).
  turnout: number | null;
  // Provinces edited by hand (P-07), by INE code, with shares of that
  // province's valid votes. Absent when none is locked.
  provinces?: Record<string, ProvinceShares>;
  // The base election's blocs as the user edited them (FR-11). Absent while
  // they are the default ones.
  blocs?: Bloc[];
};

export type ProvinceShares = {
  shares: Record<string, number>;
  blank: number;
};

export const FULL_SHARE = 10_000;
