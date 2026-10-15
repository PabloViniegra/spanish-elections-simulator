import { fitProjection, iso, type Plan, type Point3 } from "@/components/iso/iso-kit";
import { HEMICYCLE_CENTER } from "@/lib/hemicycle-layout";
import { FULL_SHARE, MAX_COLUMNS } from "./constants";

export const WIDTH = 760;
export const HEIGHT = 440;
const AZIMUTH = 62;

export const BASE: Plan = { x: -244, y: -84, w: 492, d: 146, r: 10 };
export const BASE_H = 9;
export const FOOT_H = 5;

// Hemicycle: the home layout scaled into world units, opening toward the viewer.
export const HEMI = { x: -118, y: 34 };
export const HEMI_SCALE = 0.8;
export const ROWS = 10;
export const ROW_GAP = 7.5 * HEMI_SCALE;
export const INNER = 46 * HEMI_SCALE;
export const TIER_RISE = 1.6;
export const PLINTH_H = 3;
export const tierTop = (row: number) => PLINTH_H + TIER_RISE * (row + 1);
export const SEAT_R = 2.1;
export const SEAT_H = 1.8;

export const seatAt = (x: number, y: number) => {
  const dx = (x - HEMICYCLE_CENTER.x) * HEMI_SCALE;
  const dy = (y - HEMICYCLE_CENTER.y) * HEMI_SCALE;
  const row = Math.round((Math.hypot(dx, dy) - INNER) / ROW_GAP);
  return { x: HEMI.x + dx, y: HEMI.y + dy, row };
};

// Machine: one column per candidacy, a bar that falls in front of them, and
// a coin tray per column in front of the bar.
export const BED: Plan = { x: 10, y: -30, w: 232, d: 74, r: 5 };
export const BED_H = 5;
export const SOCKET_H = 3;
export const COLUMN_Z = BED_H + SOCKET_H;
export const COLUMN_HALF = 7.5;
export const COLUMN_Y = -8;
export const SPAN = 150;
export const columnX = (index: number) => 52 + index * 30;
export const levelOf = (share: number) => COLUMN_Z + (share / FULL_SHARE) * SPAN;

export const POST_Y = 4;
export const POSTS = [22, 226];
export const POST_HALF = 5;
export const POST_TOP = COLUMN_Z + SPAN + 10;
export const BEAM_H = 6;
export const BAR_Y = 12.4;
export const BAR_HALF = 2.4;
export const BAR_H = 2.6;
// Top of the bar before the first seat, just under the beam.
export const BAR_REST = POST_TOP - 6;
export const SCREW_X = 236;

export const TRAY_Y = 26;
export const TRAY_Z = BED_H;
export const TRAY_H = 2;
export const COIN_R = 5.4;
export const COIN_H = 1.3;

export const SLOTS = Array.from({ length: MAX_COLUMNS }, (_, index) => columnX(index));

export const P = fitProjection(
  [
    [BASE.x, BASE.y, -BASE_H - FOOT_H],
    [BASE.x + BASE.w, BASE.y, -BASE_H - FOOT_H],
    [BASE.x, BASE.y + BASE.d, -BASE_H - FOOT_H],
    [BASE.x + BASE.w, BASE.y + BASE.d, -BASE_H - FOOT_H],
    [POSTS[0], POST_Y, POST_TOP + BEAM_H + 8],
    [SCREW_X, POST_Y, POST_TOP + BEAM_H + 8],
  ],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: AZIMUTH },
);

export const at = (point: Point3) => iso(point, P);
