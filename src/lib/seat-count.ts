import { hemicycleSeats } from "./hemicycle-layout";
import { provinces } from "./provinces";
import { simulationSeats } from "./elections/current";

// Each constituency gets a fixed slot plus a share per seat, so Madrid is
// counted visibly longer than Soria without the whole count dragging.
const SLOT_BASE_MS = 60;
const SLOT_PER_SEAT_MS = 9;
// The hero copy settles before the first constituency is counted.
const COUNT_DELAY_MS = 700;

export type CountStep = {
  code: string;
  name: string;
  seats: number;
  order: number;
  seatsSoFar: number;
  startMs: number;
  durationMs: number;
  // Mean angle of the wedge, in radians, for the leader tick.
  angle: number;
};

// Constituencies enter in INE order and take contiguous runs of seats from
// the left edge of the hemicycle, so each one reads as a wedge.
export function seatCount() {
  const seats = hemicycleSeats();
  let seatsSoFar = 0;
  let startMs = COUNT_DELAY_MS;
  const steps: CountStep[] = provinces.map(({ code, name }, index) => {
    const count = simulationSeats.get(code) ?? 0;
    const wedge = seats.slice(seatsSoFar, seatsSoFar + count);
    const durationMs = SLOT_BASE_MS + SLOT_PER_SEAT_MS * count;
    seatsSoFar += count;
    const step = {
      code,
      name,
      seats: count,
      order: index + 1,
      seatsSoFar,
      startMs,
      durationMs,
      angle: wedge.reduce((sum, seat) => sum + seat.angle, 0) / Math.max(wedge.length, 1),
    };
    startMs += durationMs;
    return step;
  });

  const seatTimings = steps.flatMap((step) =>
    Array.from({ length: step.seats }, (_, i) => step.startMs + (i / step.seats) * step.durationMs),
  );

  return {
    seats: seats.map((seat, index) => ({ ...seat, delayMs: Math.round(seatTimings[index] ?? 0) })),
    steps,
    totalMs: startMs,
  };
}
