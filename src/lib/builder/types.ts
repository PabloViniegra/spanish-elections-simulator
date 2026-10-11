// An election the user builds by hand, province by province. Unlike a
// projected Scenario it holds absolute votes, so it is stored as JSON in the
// database instead of in the URL.
export type BuiltScenario = {
  schemaVersion: 1;
  seatTable: SeatTable;
  // Every party the user may run somewhere; each brand is its own party.
  parties: BuiltParty[];
  // Provinces the user has started, by INE code. A party runs in a province
  // when it has an entry in `votes`, even with 0 votes.
  provinces: Record<string, BuiltProvince>;
};

export type SeatTable = "2023" | "2026";

export type BuiltParty = {
  id: string;
  name: string;
  colour: string;
  // The catalogue party it comes from; absent for parties the user invented.
  catalogId?: string;
};

export type BuiltProvince = {
  votes: Record<string, number>;
  blank: number;
  null: number;
};

// A list that ran in past general elections, deduplicated by acronym.
export type CatalogParty = {
  id: string;
  acronym: string;
  name: string;
  colour: string;
  // INE codes of the constituencies where it ran.
  provinces: string[];
  // Most recent election it ran in, e.g. "2023-07".
  lastElection: string;
};

export type ProvinceStatus = "empty" | "incomplete" | "over-census" | "invalid-party" | "complete";
