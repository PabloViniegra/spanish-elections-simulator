import * as k from "@/components/iso/iso-kit";
import type { Plan, Plane } from "@/components/iso/iso-kit";
import {
  BASE, BASE_H, BEAM_H, BED, BED_H, COLUMN_Z, FOOT_H, HEMI, INNER, P, PLINTH_H, POST_HALF, POST_TOP, POST_Y, POSTS,
  ROW_GAP, ROWS, SCREW_X, SLOTS, SOCKET_H, SPAN, TRAY_H, TRAY_Y, TRAY_Z, BAR_HALF, BAR_H, BAR_Y, COLUMN_HALF, COLUMN_Y, levelOf, tierTop,
} from "./view";
import { THRESHOLD } from "./constants";

const byDepth = (points: Plane[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screwsOf = (plan: Plan, inset: number, z: number) => ({
  rings: k.corners(plan, inset).map(([x, y]) => k.ring(x, y, 1.8, z, P, 14)).join(""),
  dots: k.pointsAt(k.corners(plan, inset).map(([x, y]) => [x, y, z]), P),
});
const labelOf = (plan: Plan, z: number) => ({
  plate: k.slabOf(plan, z, 0.8, P, 3),
  inset: k.planOutline(k.insetPlan(plan, 1.6), z + 0.8, P, 3),
  rules: [0.3, 0.5, 0.7]
    .map((at, index) => k.lineOnTop([plan.x + 4, plan.y + plan.d * at], [plan.x + plan.w * (0.8 - index * 0.18), plan.y + plan.d * at], z + 0.8, P))
    .join(""),
  screws: k.pointsAt([[plan.x + 2.4, plan.y + plan.d / 2, z + 0.8], [plan.x + plan.w - 2.4, plan.y + plan.d / 2, z + 0.8]], P),
});

export const BASE_ART = {
  halo: k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P),
  feet: byDepth(k.corners(BASE, 26)).map(([x, y]) => [k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.6, P, 28), k.cylinder(x, y, 6, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28)]),
  slab: k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.6),
  groove: k.planOutline(k.insetPlan(BASE, 6), 0, P),
  screws: screwsOf(BASE, 13, 0),
  label: labelOf({ x: -34, y: 44, w: 34, d: 12, r: 1 }, 0),
};

// The plinth is a D: a half disc behind the hemicycle's centre line plus the
// strip in front where the Mesa stands.
const OUTER = INNER + (ROWS - 1) * ROW_GAP + ROW_GAP / 2 + 4;
const halfDisc = (radius: number, from: number, to: number, steps = 40): Plane[] =>
  Array.from({ length: steps + 1 }, (_, step) => {
    const angle = from + ((to - from) * step) / steps;
    return [HEMI.x + radius * Math.cos(angle), HEMI.y - radius * Math.sin(angle)];
  });
const plinthRing: Plane[] = [...halfDisc(OUTER, 0, Math.PI, 56), [HEMI.x - OUTER, HEMI.y + 14], [HEMI.x + OUTER, HEMI.y + 14]];

// Each tier is a band of the half ring. The band is cut at 28°: right of that
// the outer rows are nearer the viewer than the inner ones, so the two pieces
// paint in opposite orders.
export const FLANK = (28 * Math.PI) / 180;
const band = (row: number, from: number, to: number) => {
  const inner = INNER + row * ROW_GAP - ROW_GAP / 2;
  const outer = inner + ROW_GAP;
  const ring = [...halfDisc(outer, from, to, 36), ...halfDisc(inner, to, from, 36)];
  return k.extrude(ring, PLINTH_H, tierTop(row) - PLINTH_H, P, { convex: false });
};

export const HEMI_ART = {
  plinth: k.extrude(plinthRing, 0, PLINTH_H, P, { convex: false }),
  plinthEdge: k.ringSeam(plinthRing, PLINTH_H - 1, P),
  floor: k.onTop(halfDisc(INNER - ROW_GAP / 2 - 1.2, 0, Math.PI, 40), PLINTH_H, P),
  main: Array.from({ length: ROWS }, (_, row) => band(row, FLANK, Math.PI)),
  flank: Array.from({ length: ROWS }, (_, row) => band(row, 0, FLANK)),
  mesa: k.slabOf({ x: HEMI.x - 20, y: HEMI.y + 2, w: 40, d: 8, r: 1.2 }, PLINTH_H, 6, P, 3, 0.5),
  mesaStep: k.slabOf({ x: HEMI.x - 24, y: HEMI.y + 1, w: 48, d: 11, r: 1.5 }, PLINTH_H, 1.6, P, 3),
  tribuna: k.slabOf({ x: HEMI.x - 4, y: HEMI.y - 9, w: 8, d: 5, r: 1 }, PLINTH_H, 7, P, 3, 0.4),
  bench: k.slabOf({ x: HEMI.x - 15, y: HEMI.y - 20, w: 30, d: 4, r: 1 }, PLINTH_H, 3.2, P, 3, 0.4),
};

export const BED_ART = {
  slab: k.slabOf(BED, 0, BED_H, P, 6, 1),
  groove: k.planOutline(k.insetPlan(BED, 4), BED_H, P, 6),
  screws: screwsOf(BED, 8, BED_H),
  label: labelOf({ x: 140, y: 38, w: 34, d: 5, r: 0.8 }, BED_H),
  sockets: SLOTS.map((x) => k.slabOf({ x: x - 9.5, y: -17.5, w: 19, d: 19, r: 2 }, BED_H, SOCKET_H, P, 3, 0.5)),
  socketScrews: k.pointsAt(SLOTS.flatMap((x) => k.corners({ x: x - 9.5, y: -17.5, w: 19, d: 19, r: 2 }, 2.2).map(([px, py]): k.Point3 => [px, py, BED_H + SOCKET_H])), P),
  trays: SLOTS.map((x) => k.slabOf({ x: x - 9, y: TRAY_Y - 9, w: 18, d: 18, r: 3 }, TRAY_Z, TRAY_H, P, 4, 0.5)),
  trayWells: SLOTS.map((x) => k.ring(x, TRAY_Y, 6.4, TRAY_Z + TRAY_H, P, 32)),
};

const postPlan = (x: number): Plan => ({ x: x - POST_HALF, y: POST_Y - POST_HALF, w: POST_HALF * 2, d: POST_HALF * 2, r: 1 });
const beamPlan: Plan = { x: POSTS[0] - 7, y: POST_Y - 6, w: SCREW_X - POSTS[0] + 13, d: 12, r: 2 };
const strip: Plan = { x: POSTS[0] + POST_HALF, y: POST_Y - 3.5, w: 1, d: 7, r: 0.3 };
const face = strip.x + strip.w;
const tickAt = (share: number, length: number) =>
  k.segment([face, strip.y + strip.d, levelOf(share)], [face, strip.y + strip.d - length, levelOf(share)], P);
const percents = Array.from({ length: 56 }, (_, step) => step);

export const FRAME_ART = {
  feet: POSTS.map((x) => k.slabOf({ x: x - 8, y: POST_Y - 8, w: 16, d: 16, r: 2 }, BED_H, 2.4, P, 3, 0.5)),
  footScrews: k.pointsAt(POSTS.flatMap((x) => k.corners({ x: x - 8, y: POST_Y - 8, w: 16, d: 16, r: 2 }, 2).map(([px, py]): k.Point3 => [px, py, BED_H + 2.4])), P),
  posts: POSTS.map((x) => k.slabOf(postPlan(x), BED_H + 2.4, POST_TOP - BED_H - 2.4, P, 2)),
  postSeams: POSTS.map((x) => k.sideSeam(postPlan(x), COLUMN_Z + SPAN / 2, P, 2)).join(""),
  strip: k.slabOf(strip, COLUMN_Z - 1, SPAN + 2, P, 1),
  minor: percents.filter((step) => step % 5).map((step) => tickAt(step / 100, 2.4)).join(""),
  major: percents.filter((step) => !(step % 5)).map((step) => tickAt(step / 100, 4.6)).join(""),
  stop: k.slabOf({ x: face, y: strip.y + 2, w: 2.6, d: 3.2, r: 0.4 }, levelOf(THRESHOLD) - 0.6, 1.2, P, 1),
  stopLine: tickAt(0.03, 7),
  screw: k.cylinder(SCREW_X, POST_Y - 2, 1.5, BED_H, POST_TOP - BED_H, P, 16),
  screwThread: Array.from({ length: Math.floor((POST_TOP - BED_H - 4) / 2.2) }, (_, step) => k.sideArc(SCREW_X, POST_Y - 2, 1.5, BED_H + 3 + step * 2.2, P, 8)).join(""),
  bearing: k.slabOf({ x: SCREW_X - 4, y: POST_Y - 6, w: 8, d: 8, r: 1.5 }, BED_H, 4, P, 3, 0.4),
  beam: k.slabOf(beamPlan, POST_TOP, BEAM_H, P, 3, 0.8),
  beamSeam: k.sideSeam(beamPlan, POST_TOP + BEAM_H / 2, P, 3),
  beamScrews: k.pointsAt([...POSTS, SCREW_X].map((x): k.Point3 => [x, POST_Y - 2, POST_TOP + BEAM_H]), P),
  wheel: k.cylinder(SCREW_X, POST_Y - 2, 8, POST_TOP + BEAM_H + 1.6, 2.6, P, 40, 0.5),
  wheelKnurl: k.knurl(SCREW_X, POST_Y - 2, 8, POST_TOP + BEAM_H + 1.6, POST_TOP + BEAM_H + 4.2, 48, P, 0.3),
  wheelNeck: k.cylinder(SCREW_X, POST_Y - 2, 2.6, POST_TOP + BEAM_H, 1.6, P, 16),
  hub: k.ring(SCREW_X, POST_Y - 2, 2, POST_TOP + BEAM_H + 4.2, P, 16),
};

export const WHEEL_TOP = POST_TOP + BEAM_H + 4.2;

// The bar is built with its top at z = 0 and moved up to the current level.
const carriage = (x: number): Plan => ({ x: x - 6.5, y: POST_Y + POST_HALF, w: 13, d: 6.5, r: 1.2 });
const barPlan: Plan = { x: POSTS[0], y: BAR_Y - BAR_HALF, w: POSTS[1] - POSTS[0], d: BAR_HALF * 2, r: 0.8 };
export const BAR_ART = {
  feelers: SLOTS.map((x) => k.slabOf({ x: x - 1.2, y: COLUMN_Y + COLUMN_HALF, w: 2.4, d: barPlan.y - COLUMN_Y - COLUMN_HALF, r: 0.4 }, -1.4, 1, P, 1)),
  bar: k.slabOf(barPlan, -BAR_H, BAR_H, P, 2, 0.4),
  edge: k.ringSeam(k.ringOf(barPlan, 2), 0, P),
  carriages: POSTS.map((x) => k.slabOf(carriage(x), -6, 9, P, 3, 0.5)),
  carriageScrews: k.pointsAt(POSTS.flatMap((x): k.Point3[] => [[x - 4, POST_Y + POST_HALF + 6.5, -3.5], [x + 4, POST_Y + POST_HALF + 6.5, -3.5]]), P),
  knobs: POSTS.map((x) => k.cylinder(x, POST_Y + POST_HALF + 3.2, 2.2, 3, 2, P, 16)),
  nut: k.slabOf({ x: SCREW_X - 3.5, y: POST_Y - 6.5, w: 7.5, d: POST_HALF + 6.5 + 6.5, r: 1.2 }, -6, 9, P, 3, 0.5),
  nutDots: k.pointsAt([[SCREW_X + 2, POST_Y + POST_HALF + 3, 3], [SCREW_X + 2, POST_Y - 3.5, 3]], P),
};
