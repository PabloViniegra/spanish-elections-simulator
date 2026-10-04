import { describe, expect, it } from "vitest";
import { MAJORITY, TOTAL_SEATS, hemicycleSeats } from "./hemicycle-layout";

describe("hemicycleSeats", () => {
  const seats = hemicycleSeats();

  it("places every one of the 350 seats", () => {
    expect(seats).toHaveLength(TOTAL_SEATS);
  });

  it("marks exactly the first 176 seats as the majority", () => {
    expect(seats.filter((seat) => seat.majority)).toHaveLength(MAJORITY);
  });

  it("keeps every seat inside the drawing", () => {
    expect(seats.every((seat) => seat.x > 0 && seat.y > 0)).toBe(true);
  });
});
