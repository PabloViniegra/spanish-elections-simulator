import { HEMICYCLE_CENTER, hemicycleSeats } from "@/lib/hemicycle-layout";
import { ELECTED_SENATORS, TOTAL_SENATORS, designated, senate2023 } from "./senate";

export type ChamberGroup = { name: string; seats: number; elected: boolean };
export type ChamberSeat = { x: number; y: number; order: number; group: number };

export const chamberGroups: ChamberGroup[] = [
  ...senate2023.constituencies.map(({ name, seats }) => ({ name, seats, elected: true })),
  ...designated.map(({ name, seats }) => ({ name, seats, elected: false })),
];

// Keys are rounded so server and browser trig never disagree on a tie.
const round = (value: number) => Math.round(value * 1000);
const layout = hemicycleSeats(TOTAL_SENATORS)
  .map((seat) => ({
    ...seat,
    radius: round(Math.hypot(seat.x - HEMICYCLE_CENTER.x, seat.y - HEMICYCLE_CENTER.y)),
    slant: round(Math.abs(seat.angle - Math.PI / 2)),
    sweep: round(seat.angle),
  }))
  .sort((a, b) => a.radius - b.radius || a.slant - b.slant || b.sweep - a.sweep)
  .map((seat, order) => ({ ...seat, order }));

// The outer rim goes to the designated senators; inside each set, seats are
// handed out left to right so every group reads as one radial wedge.
const owners = chamberGroups.flatMap(({ seats }, group) => Array.from({ length: seats }, () => group));
const byAngle = (seats: typeof layout) => [...seats].sort((a, b) => b.sweep - a.sweep || a.radius - b.radius);

export const chamberSeats: ChamberSeat[] = [...byAngle(layout.slice(0, ELECTED_SENATORS)), ...byAngle(layout.slice(ELECTED_SENATORS))].map(
  ({ x, y, order }, i) => ({ x, y, order, group: owners[i] }),
);

export function nearestGroup(x: number, y: number, reach: number) {
  let best: ChamberSeat | undefined;
  let bestDistance = reach;
  for (const seat of chamberSeats) {
    const distance = Math.hypot(seat.x - x, seat.y - y);
    if (distance < bestDistance) {
      best = seat;
      bestDistance = distance;
    }
  }
  return best?.group;
}
