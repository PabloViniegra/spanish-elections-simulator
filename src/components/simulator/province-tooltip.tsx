import { ProvinceSplit, type ProvinceSplitProps } from "./province-seats";

// Gap between the cursor and the card.
const OFFSET = 14;

type ProvinceTooltipProps = ProvinceSplitProps & {
  // Cursor position within the map, and the map's size.
  x: number;
  y: number;
  width: number;
  height: number;
  // Provincial mode: a click edits the province under the cursor.
  pickable: boolean;
};

// Follows the mouse over the map. Visual only: the panel below and the table
// carry the same figures for touch screens and assistive technology.
export function ProvinceTooltip({ province, x, y, width, height, pickable }: ProvinceTooltipProps) {
  // Open towards the middle of the map so the card never leaves it.
  const left = x > width / 2;
  const above = y > height / 2;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 w-max max-w-64 rounded-lg border border-hairline bg-canvas p-3 text-caption shadow-sm"
      style={{
        left: left ? x - OFFSET : x + OFFSET,
        top: above ? y - OFFSET : y + OFFSET,
        translate: `${left ? "-100%" : "0"} ${above ? "-100%" : "0"}`,
      }}
    >
      <ProvinceSplit province={province} />
      {pickable && <p className="mt-2 text-ink-muted-80">Haz clic para editar esta provincia.</p>}
    </div>
  );
}
