import { describe, expect, it } from "vitest";
import { seats2023 } from "../seats-2023";
import { allocateCongreso } from "./congreso";
import { CONSTITUENCY_CODES, HOUSE_SIZE } from "./constants";
import type { ConstituencyVotes } from "./types";

const election: ConstituencyVotes[] = [...seats2023].map(([code, seats]) => ({
  code,
  seats,
  blankVotes: 1_000,
  candidacies: [
    { id: "A", votes: 60_000 },
    { id: "B", votes: 39_000 },
    { id: "C", votes: 2_000 },
  ],
}));

describe("allocateCongreso (R-01, R-02)", () => {
  it("allocates all 350 seats across the 52 constituencies", () => {
    const results = allocateCongreso(election, "seed");
    expect(results.map((result) => result.code)).toEqual(CONSTITUENCY_CODES);
    const seated = results.flatMap((result) => result.candidacies).reduce((sum, { seats }) => sum + seats, 0);
    expect(seated).toBe(HOUSE_SIZE);
  });

  it("rejects a missing constituency, a wrong total or a multi-seat Ceuta", () => {
    expect(() => allocateCongreso(election.slice(1), "seed")).toThrow(RangeError);

    const extraSeat = election.map((entry) => (entry.code === "28" ? { ...entry, seats: entry.seats + 1 } : entry));
    expect(() => allocateCongreso(extraSeat, "seed")).toThrow(RangeError);

    const bigCeuta = election.map((entry) => {
      if (entry.code === "51") return { ...entry, seats: 2 };
      if (entry.code === "28") return { ...entry, seats: entry.seats - 1 };
      return entry;
    });
    expect(() => allocateCongreso(bigCeuta, "seed")).toThrow(RangeError);
  });
});
