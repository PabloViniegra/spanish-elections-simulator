import { describe, expect, it } from "vitest";
import { TOTAL_SEATS } from "./hemicycle-layout";
import { seatCount } from "./seat-count";

describe("seatCount", () => {
  const { seats, steps, totalMs } = seatCount();

  it("counts all 52 constituencies up to 350 seats", () => {
    expect(steps).toHaveLength(52);
    expect(steps.at(-1)?.seatsSoFar).toBe(TOTAL_SEATS);
    expect(seats).toHaveLength(TOTAL_SEATS);
  });

  it("schedules steps back to back and seats in order", () => {
    steps.slice(1).forEach((step, i) => {
      expect(step.startMs).toBe(steps[i].startMs + steps[i].durationMs);
    });
    expect(totalMs).toBe(steps.at(-1)!.startMs + steps.at(-1)!.durationMs);
    seats.slice(1).forEach((seat, i) => expect(seat.delayMs).toBeGreaterThanOrEqual(seats[i].delayMs));
  });

  it("sweeps the wedges from left to right", () => {
    steps.slice(1).forEach((step, i) => expect(step.angle).toBeLessThanOrEqual(steps[i].angle));
  });
});
