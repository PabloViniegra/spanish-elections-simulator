import map from "@/data/map/provinces.json";
import { HEMICYCLE_HEIGHT, HEMICYCLE_WIDTH } from "./hemicycle-layout";

// Distance between seat centres on the map, in hemicycle SVG units.
const SPACING = 4.3;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RELAX_ROUNDS = 80;
// How hard each seat is pulled back to its constituency between rounds.
const PULL = 0.04;

// The Canarias inset moves from the bottom-left corner, which the left foot of
// the hemicycle fills first, to the top-left one, which no seat ever reaches.
export const INSET_CODES = new Set(["35", "38"]);
export const INSET_SHIFT = { x: -128, y: -346 };

const centroids = new Map(
  map.provinces.map(({ code, x, y }) =>
    INSET_CODES.has(code) ? [code, { x: x + INSET_SHIFT.x, y: y + INSET_SHIFT.y }] : [code, { x, y }],
  ),
);

// The map fills the hemicycle's own box, padding included, so the seats start
// where the count ends up instead of off-stage.
export function mapFrame(pad: number) {
  const scale = (HEMICYCLE_HEIGHT + pad) / map.height;
  return { scale, x: (HEMICYCLE_WIDTH - map.width * scale) / 2, y: -pad };
}

function mapToHemicycle(pad: number) {
  const frame = mapFrame(pad);
  return ({ x, y }: { x: number; y: number }) => ({ x: frame.x + x * frame.scale, y: frame.y + y * frame.scale });
}

// Seats as a dot map of Spain: each constituency's seats sit in a sunflower
// around its centroid, then overlapping dots are pushed apart so dense areas
// (Madrid, Barcelona, the coast) spread instead of piling up. Deterministic,
// so the server and every replay draw the same map.
export function seatMapPositions(constituencies: { code: string; seats: number }[], pad: number) {
  const project = mapToHemicycle(pad);
  const homes: { x: number; y: number }[] = [];
  const dots = constituencies.flatMap(({ code, seats }) => {
    const home = project(centroids.get(code) ?? { x: map.width / 2, y: map.height / 2 });
    return Array.from({ length: seats }, (_, i) => {
      homes.push(home);
      const radius = SPACING * 0.55 * Math.sqrt(i + 0.5);
      return { x: home.x + radius * Math.cos(i * GOLDEN_ANGLE), y: home.y + radius * Math.sin(i * GOLDEN_ANGLE) };
    });
  });

  // The pull fades out over the rounds, so the last ones only separate dots.
  for (let round = 0; round < RELAX_ROUNDS; round++) {
    const pull = PULL * Math.max(0, 1 - round / (RELAX_ROUNDS * 0.75));
    dots.forEach((dot, i) => {
      dot.x += (homes[i].x - dot.x) * pull;
      dot.y += (homes[i].y - dot.y) * pull;
    });
    for (let a = 0; a < dots.length; a++) {
      for (let b = a + 1; b < dots.length; b++) {
        const dx = dots[b].x - dots[a].x;
        const dy = dots[b].y - dots[a].y;
        const distance = Math.hypot(dx, dy) || 0.01;
        if (distance >= SPACING) continue;
        const push = (SPACING - distance) / 2 / distance;
        dots[a].x -= dx * push;
        dots[a].y -= dy * push;
        dots[b].x += dx * push;
        dots[b].y += dy * push;
      }
    }
  }
  return dots;
}
