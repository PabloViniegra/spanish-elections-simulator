import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { allocateConstituency } from "./constituency";
import type { ConstituencyVotes } from "./types";

const constituency = (blankVotes: number, votes: readonly number[], seats = 3): ConstituencyVotes => ({
  code: "28",
  seats,
  blankVotes,
  candidacies: votes.map((count, i) => ({ id: `P${i}`, votes: count })),
});

describe("allocateConstituency threshold (R-04, R-05)", () => {
  it("keeps a candidacy at exactly 3% of valid votes and drops one just below", () => {
    const atThreshold = allocateConstituency(constituency(0, [9_700, 300]), "seed");
    expect(atThreshold.candidacies[1].excluded).toBe(false);

    const below = allocateConstituency(constituency(1, [9_700, 300]), "seed");
    expect(below.candidacies[1].excluded).toBe(true);
  });

  it("counts blank votes in the threshold denominator", () => {
    // 300 of 9,000 is 3.3%, but 300 of 11,000 valid votes is 2.7%.
    const result = allocateConstituency(constituency(2_000, [8_700, 300], 10), "seed");
    expect(result.validVotes).toBe(11_000);
    expect(result.candidacies[1]).toMatchObject({ excluded: true, seats: 0 });
    expect(result.candidacies[0].seats).toBe(10);
  });

  it("leaves seats vacant when no candidacy passes the threshold", () => {
    const result = allocateConstituency(constituency(1_000, [20, 20]), "seed");
    expect(result.awards).toEqual([]);
    expect(result.vacantSeats).toBe(3);
  });
});

describe("allocateConstituency input checks", () => {
  it("rejects negative or fractional votes, missing seats and repeated ids", () => {
    expect(() => allocateConstituency(constituency(0, [-1]), "seed")).toThrow(RangeError);
    expect(() => allocateConstituency(constituency(0.5, [1]), "seed")).toThrow(RangeError);
    expect(() => allocateConstituency(constituency(0, [1], 0), "seed")).toThrow(RangeError);
    const repeated = { ...constituency(0, [1, 2]), candidacies: [{ id: "X", votes: 1 }, { id: "X", votes: 2 }] };
    expect(() => allocateConstituency(repeated, "seed")).toThrow(RangeError);
  });
});

describe("allocateConstituency properties", () => {
  const votes = fc.integer({ min: 0, max: 2_000_000 });
  const scenario = fc.record({
    seats: fc.integer({ min: 1, max: 37 }),
    blankVotes: votes,
    votes: fc.array(votes, { minLength: 1, maxLength: 12 }),
  });

  it("fills every seat unless nobody passes, and never seats an excluded candidacy", () => {
    fc.assert(
      fc.property(scenario, ({ seats, blankVotes, votes: counts }) => {
        const result = allocateConstituency(constituency(blankVotes, counts, seats), "seed");
        const seated = result.candidacies.reduce((sum, candidacy) => sum + candidacy.seats, 0);
        expect(seated + result.vacantSeats).toBe(seats);
        const contenders = result.candidacies.filter((candidacy) => !candidacy.excluded && candidacy.votes > 0);
        expect(result.vacantSeats).toBe(contenders.length > 0 ? 0 : seats);
        result.candidacies
          .filter((candidacy) => candidacy.excluded)
          .forEach((candidacy) => expect(candidacy.seats).toBe(0));
      }),
    );
  });

  it("never takes seats from a candidacy whose votes alone go up", () => {
    const raise = fc.tuple(scenario, fc.nat(), fc.integer({ min: 1, max: 500_000 }));
    fc.assert(
      fc.property(raise, ([{ seats, blankVotes, votes: counts }, pick, extra]) => {
        const index = pick % counts.length;
        const raised = counts.map((count, i) => (i === index ? count + extra : count));
        const before = allocateConstituency(constituency(blankVotes, counts, seats), "seed");
        const after = allocateConstituency(constituency(blankVotes, raised, seats), "seed");
        expect(after.candidacies[index].seats).toBeGreaterThanOrEqual(before.candidacies[index].seats);
      }),
    );
  });

  it("gives the same result for the same inputs and seed (NFR-04)", () => {
    fc.assert(
      fc.property(scenario, fc.string(), ({ seats, blankVotes, votes: counts }, seed) => {
        const input = constituency(blankVotes, counts, seats);
        expect(allocateConstituency(input, seed)).toEqual(allocateConstituency(input, seed));
      }),
    );
  });
});
