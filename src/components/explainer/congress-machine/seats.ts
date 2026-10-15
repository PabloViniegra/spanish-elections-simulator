import { cameraOf, depthOf, iso } from "@/components/iso/iso-kit";
import { CONGRESS, SEAT_LAYOUT } from "./model";
import { FLANK } from "./geometry";
import { P, ROWS, SEAT_H, SEAT_R, seatAt, tierTop } from "./view";

// A seat is a small puck. Horizontal circles project to axis-aligned
// ellipses in this camera, so each puck is two ellipses and the band between.
const { k, sinE, cosE } = cameraOf(P);
const fine = (value: number) => Math.round(value * 100) / 100;

export type SeatArt = { slot: number; code: string; colour: string; cx: number; top: number; bottom: number; rx: number; ry: number };

const seats = SEAT_LAYOUT.map((seat, slot) => {
  const { x, y, row } = seatAt(seat.x, seat.y);
  const z = tierTop(row);
  const [cx, bottom] = iso([x, y, z], P);
  return {
    row,
    flank: seat.angle < FLANK,
    depth: depthOf([x, y, z], P),
    art: {
      slot,
      code: CONGRESS[slot].code,
      colour: CONGRESS[slot].colour,
      cx: fine(cx),
      top: fine(bottom - SEAT_H * cosE * k),
      bottom: fine(bottom),
      rx: fine(SEAT_R * k),
      ry: fine(SEAT_R * k * sinE),
    } satisfies SeatArt,
  };
});

const rowOf = (row: number, flank: boolean) =>
  seats.filter((seat) => seat.row === row && seat.flank === flank).sort((a, b) => a.depth - b.depth).map((seat) => seat.art);

export const MAIN_ROWS = Array.from({ length: ROWS }, (_, row) => rowOf(row, false));
export const FLANK_ROWS = Array.from({ length: ROWS }, (_, row) => rowOf(row, true));
