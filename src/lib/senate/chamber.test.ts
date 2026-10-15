import { describe, expect, it } from "vitest";
import { chamberGroups, chamberSeats, nearestGroup } from "./chamber";
import { TOTAL_SENATORS } from "./senate";

describe("Senate chamber", () => {
  it("gives every group exactly its seats", () => {
    expect(chamberSeats).toHaveLength(TOTAL_SENATORS);
    chamberGroups.forEach(({ seats }, group) => expect(chamberSeats.filter((seat) => seat.group === group)).toHaveLength(seats));
  });

  it("keeps the designated senators on the outer rim", () => {
    const order = (elected: boolean) => chamberSeats.filter((seat) => chamberGroups[seat.group].elected === elected).map((seat) => seat.order);
    expect(Math.max(...order(true))).toBeLessThan(Math.min(...order(false)));
  });

  it("finds the group of the closest seat within reach", () => {
    const seat = chamberSeats[10];
    expect(nearestGroup(seat.x + 0.5, seat.y, 4)).toBe(seat.group);
    expect(nearestGroup(-500, -500, 4)).toBeUndefined();
  });
});
