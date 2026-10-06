import { describe, expect, it } from "vitest";
import type { ConstituencyResult } from "@/lib/engine/types";
import { provinceWinners } from "./province-winners";

const constituency = (code: string, candidacies: { id: string; votes: number; seats: number }[]): ConstituencyResult => ({
  code,
  seats: candidacies.reduce((sum, { seats }) => sum + seats, 0),
  validVotes: candidacies.reduce((sum, { votes }) => sum + votes, 0),
  candidacies: candidacies.map((candidacy) => ({ ...candidacy, excluded: false })),
  awards: [],
  vacantSeats: 0,
});

describe("provinceWinners (FR-07)", () => {
  it("picks the bloc with the most seats and lists the rest by seats", () => {
    const outcome = provinceWinners([
      constituency("28", [
        { id: "a", votes: 100, seats: 2 },
        { id: "b", votes: 300, seats: 5 },
        { id: "c", votes: 10, seats: 0 },
      ]),
    ]).get("28");
    expect(outcome).toEqual({ leaders: ["b"], seats: [{ id: "b", seats: 5 }, { id: "a", seats: 2 }] });
  });

  it("keeps a tie in seats as a tie, more votes first", () => {
    const outcome = provinceWinners([
      constituency("02", [
        { id: "a", votes: 900, seats: 2 },
        { id: "b", votes: 1000, seats: 2 },
        { id: "c", votes: 500, seats: 0 },
      ]),
    ]).get("02");
    expect(outcome?.leaders).toEqual(["b", "a"]);
  });

  it("has no leader when no bloc takes a seat", () => {
    expect(provinceWinners([constituency("51", [{ id: "a", votes: 0, seats: 0 }])]).get("51")).toEqual({ leaders: [], seats: [] });
  });
});
