import { describe, expect, it } from "vitest";
import { HEMICYCLE_HEIGHT, HEMICYCLE_WIDTH, TOTAL_SEATS } from "./hemicycle-layout";
import { seatCount } from "./seat-count";
import { seatMapPositions } from "./seat-map";

const PAD = 12;

describe("seatMapPositions", () => {
  const dots = seatMapPositions(seatCount().steps, PAD);

  it("places every seat inside the hemicycle's padded box", () => {
    expect(dots).toHaveLength(TOTAL_SEATS);
    dots.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(-PAD);
      expect(x).toBeLessThanOrEqual(HEMICYCLE_WIDTH + PAD);
      expect(y).toBeGreaterThanOrEqual(-PAD);
      expect(y).toBeLessThanOrEqual(HEMICYCLE_HEIGHT);
    });
  });

  it("keeps seats apart instead of piling them up", () => {
    let closest = Infinity;
    dots.forEach((a, i) => dots.slice(i + 1).forEach((b) => (closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y)))));
    expect(closest).toBeGreaterThan(3);
  });
});
