import { describe, expect, it } from "vitest";
import { dhondt } from "./dhondt";
import { drawLots } from "./lot";
import type { Candidacy } from "./types";

const seatsOf = (candidacies: readonly Candidacy[], seats: number, seed = "seed") => {
  const { awards } = dhondt(candidacies, seats, seed);
  return awards.map((award) => award.candidacyId).join("");
};

describe("dhondt (R-06)", () => {
  it("hands seats to the largest quotients in order", () => {
    const candidacies = [
      { id: "A", votes: 100_000 },
      { id: "B", votes: 80_000 },
      { id: "C", votes: 30_000 },
      { id: "D", votes: 20_000 },
    ];
    expect(seatsOf(candidacies, 8)).toBe("ABABACBA");
  });

  it("records the winning quotient of every seat", () => {
    const { awards } = dhondt([{ id: "A", votes: 90 }, { id: "B", votes: 40 }], 3, "seed");
    expect(awards.map(({ votes, divisor }) => `${votes}/${divisor}`)).toEqual(["90/1", "90/2", "40/1"]);
  });

  it("reduces to plurality in single-seat constituencies (R-09)", () => {
    expect(seatsOf([{ id: "A", votes: 10 }, { id: "B", votes: 11 }], 1)).toBe("B");
  });

  it("never awards a seat to a candidacy without votes", () => {
    const { awards, vacantSeats } = dhondt([{ id: "A", votes: 0 }], 2, "seed");
    expect(awards).toEqual([]);
    expect(vacantSeats).toBe(2);
  });
});

describe("dhondt ties (R-07)", () => {
  it("gives a contested tie to the candidacy with more total votes", () => {
    // A/2 and B/1 both equal 100 for the last seat.
    const { awards } = dhondt([{ id: "B", votes: 100 }, { id: "A", votes: 200 }], 2, "seed");
    expect(awards.map((award) => award.candidacyId)).toEqual(["A", "A"]);
    expect(awards.some((award) => award.decidedByLot)).toBe(false);
  });

  it("does not draw lots when every tied quotient gets a seat", () => {
    const { awards } = dhondt([{ id: "A", votes: 100 }, { id: "B", votes: 100 }], 2, "seed");
    expect(awards.map((award) => award.candidacyId).sort()).toEqual(["A", "B"]);
    expect(awards.some((award) => award.decidedByLot)).toBe(false);
  });

  it("draws lots on full ties, the same way for the same seed", () => {
    const tie = [{ id: "A", votes: 100 }, { id: "B", votes: 100 }];
    const { awards } = dhondt(tie, 1, "seed");
    expect(awards).toHaveLength(1);
    expect(awards[0].decidedByLot).toBe(true);
    expect(seatsOf(tie, 1)).toBe(seatsOf(tie, 1));

    const winners = new Set(Array.from({ length: 20 }, (_, i) => seatsOf(tie, 1, `seed-${i}`)));
    expect(winners).toEqual(new Set(["A", "B"]));
  });

  it("settles consecutive lots in the drawn order", () => {
    // Three equal candidacies for two seats: two consecutive lots.
    const tie = [{ id: "A", votes: 100 }, { id: "B", votes: 100 }, { id: "C", votes: 100 }];
    for (let i = 0; i < 20; i++) {
      const { awards } = dhondt(tie, 2, `seed-${i}`);
      expect(awards.every((award) => award.decidedByLot)).toBe(true);
      expect(awards.map((award) => award.candidacyId)).toEqual(drawLots(["A", "B", "C"], `seed-${i}`).slice(0, 2));
    }
  });
});
