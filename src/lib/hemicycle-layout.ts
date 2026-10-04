export const TOTAL_SEATS = 350;
export const MAJORITY = 176;

const ROWS = 10;
const INNER_RADIUS = 46;
const ROW_GAP = 7.5;

export const HEMICYCLE_OUTER_RADIUS = INNER_RADIUS + (ROWS - 1) * ROW_GAP;
export const HEMICYCLE_WIDTH = 2 * HEMICYCLE_OUTER_RADIUS + 12;
export const HEMICYCLE_HEIGHT = HEMICYCLE_OUTER_RADIUS + 6;
export const HEMICYCLE_CENTER = { x: HEMICYCLE_WIDTH / 2, y: HEMICYCLE_HEIGHT - 3 };

// Seats spread over concentric half rings in proportion to the length of each
// ring, then numbered from the left edge sweeping to the right, as in a parliament.
export function hemicycleSeats() {
  const radii = Array.from({ length: ROWS }, (_, row) => INNER_RADIUS + row * ROW_GAP);
  const radiiSum = radii.reduce((sum, radius) => sum + radius, 0);
  const exact = radii.map((radius) => (radius / radiiSum) * TOTAL_SEATS);
  const counts = exact.map(Math.floor);
  let missing = TOTAL_SEATS - counts.reduce((sum, count) => sum + count, 0);
  exact
    .map((value, row) => ({ row, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ row }) => {
      if (missing > 0) {
        counts[row] += 1;
        missing -= 1;
      }
    });

  const { x: centerX, y: centerY } = HEMICYCLE_CENTER;
  return radii
    .flatMap((radius, row) =>
      Array.from({ length: counts[row] }, (_, index) => {
        const angle = Math.PI * (1 - index / (counts[row] - 1));
        return {
          angle,
          x: centerX + radius * Math.cos(angle),
          y: centerY - radius * Math.sin(angle),
        };
      }),
    )
    .sort((a, b) => b.angle - a.angle)
    .map((seat, index) => ({ ...seat, majority: index < MAJORITY }));
}
