import { ProvinceSplit, type ProvinceSplitProps } from "./province-seats";

const OFFSET = 14;

type ProvinceTooltipProps = ProvinceSplitProps & {
  x: number;
  y: number;
  width: number;
  height: number;
  hint: string | null;
};

// Visual only: the panel below and the table carry the same figures for touch and assistive technology.
export function ProvinceTooltip({ province, x, y, width, height, hint }: ProvinceTooltipProps) {
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
      {hint && <p className="mt-2 text-ink-muted-80">{hint}</p>}
    </div>
  );
}
