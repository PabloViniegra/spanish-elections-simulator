import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { allocateConstituency } from "./constituency";
import { dhondtDetail } from "./last-seat";
import type { ConstituencyVotes } from "./types";

const constituency = (votes: readonly number[], seats: number, blankVotes = 0): ConstituencyVotes => ({
  code: "28",
  seats,
  blankVotes,
  candidacies: votes.map((count, i) => ({ id: `P${i}`, votes: count })),
});
const detail = (votes: readonly number[], seats: number, blankVotes = 0) =>
  dhondtDetail(allocateConstituency(constituency(votes, seats, blankVotes), "seed"));

describe("dhondtDetail (FR-09)", () => {
  it("lays out the quotient table with the seat order", () => {
    const { rows } = detail([100, 80, 30], 4);
    expect(rows.map((row) => row.candidacyId)).toEqual(["P0", "P1", "P2"]);
    // P0 wins seats 1 and 3, P1 seats 2 and 4: three columns cover them all.
    expect(rows[0].quotients).toEqual([
      { divisor: 1, quotient: 100, seat: 1, decidedByLot: false },
      { divisor: 2, quotient: 50, seat: 3, decidedByLot: false },
      { divisor: 3, quotient: 100 / 3, seat: null, decidedByLot: false },
    ]);
    expect(rows[1].quotients.map((cell) => cell.seat)).toEqual([2, 4, null]);
    expect(rows[2]).toMatchObject({ seats: 0, quotients: [{ quotient: 30, seat: null }, { seat: null }, { seat: null }] });
  });

  it("names the last seat and the best quotient left among the others", () => {
    const { lastSeat, runnerUp } = detail([100, 80, 30], 4);
    expect(lastSeat).toMatchObject({ candidacyId: "P1", divisor: 2, quotient: 40, decidedByLot: false });
    // P0's third quotient (33.3) beats P2's first (30).
    expect(runnerUp).toMatchObject({ candidacyId: "P0", divisor: 3, quotient: 100 / 3 });
    // 3 × 40 = 120 ties the quotient with more votes than P1's 80 (R-07).
    expect(runnerUp?.votesToFlip).toBe(20);
  });

  it("needs one vote past a tie the challenger would lose", () => {
    // Last seat P0 at 100/1; P1 at 50/1 needs 100, a tie on quotient and votes,
    // so 101.
    expect(detail([100, 50], 1).runnerUp?.votesToFlip).toBe(51);
  });

  it("flags a seat decided by lot", () => {
    // Equal quotients and equal votes for one seat (R-07).
    const { rows, lastSeat } = detail([100, 100], 1);
    expect(lastSeat?.decidedByLot).toBe(true);
    expect(rows.flatMap((row) => row.quotients).filter((cell) => cell.decidedByLot)).toHaveLength(1);
  });

  it("leaves out candidacies below the threshold", () => {
    const { rows, runnerUp } = detail([9_700, 300], 2, 1);
    expect(rows.map((row) => row.candidacyId)).toEqual(["P0"]);
    expect(runnerUp).toBeNull();
  });

  it("has no last seat when every seat is vacant", () => {
    expect(detail([20, 20], 3, 1_000)).toEqual({ rows: [], lastSeat: null, runnerUp: null });
  });

  it("takes the last seat with exactly the votes it reports (property)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 10_000, max: 20_000 }), { minLength: 2, maxLength: 6 }),
        fc.integer({ min: 1, max: 10 }),
        (votes, seats) => {
          const { runnerUp } = detail(votes, seats);
          if (!runnerUp) return;
          const index = Number(runnerUp.candidacyId.slice(1));
          const allocate = (extra: number) =>
            allocateConstituency(constituency(votes.with(index, votes[index] + extra), seats), "seed");
          const before = allocate(0).candidacies[index].seats;
          expect(allocate(runnerUp.votesToFlip).candidacies[index].seats).toBe(before + 1);
          // One vote short it can still win a full tie, but only by lot (R-07).
          const short = allocate(Math.max(0, runnerUp.votesToFlip - 1));
          if (runnerUp.votesToFlip > 0 && !short.awards.some((award) => award.decidedByLot)) {
            expect(short.candidacies[index].seats).toBe(before);
          }
        },
      ),
    );
  });
});
