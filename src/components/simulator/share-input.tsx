import type { CSSProperties } from "react";
import { FULL_SHARE } from "@/lib/scenario/types";
import { formatShare } from "./format";

type ShareInputProps = {
  id: string;
  label: string;
  // Basis points of national valid votes.
  value: number;
  onChange: (value: number) => void;
  // Party colour for the slider; neutral ink when the row is not a party.
  colour?: string;
};

// No bloc has passed 50% in a general election, so the slider stops there.
// Its travel is a square-root scale: most blocs sit under 3%, and a linear
// track would leave them a few pixels to work with. The field stays exact.
const SLIDER_MAX = FULL_SHARE / 2;
const SLIDER_STEPS = 1000;
const toPosition = (value: number) => Math.round(Math.sqrt(Math.min(value, SLIDER_MAX) / SLIDER_MAX) * SLIDER_STEPS);
const fromPosition = (position: number) => Math.round((position / SLIDER_STEPS) ** 2 * SLIDER_MAX);

// One national share as a slider plus an exact field, both in percent.
// Both scroll clear of the pinned strip and share budget when focused.
export function ShareInput({ id, label, value, onChange, colour = "var(--color-ink)" }: ShareInputProps) {
  const update = (percent: number) =>
    onChange(Number.isNaN(percent) ? 0 : Math.min(FULL_SHARE, Math.max(0, Math.round(percent * 100))));
  const sliderStyle: CSSProperties & Record<`--${string}`, string> = {
    "--slider-colour": colour,
    "--fill": `${toPosition(value) / 10}%`,
  };
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        aria-label={label}
        min={0}
        max={SLIDER_STEPS}
        step={1}
        value={toPosition(value)}
        aria-valuetext={formatShare(value)}
        onChange={(event) => onChange(fromPosition(event.target.valueAsNumber))}
        style={sliderStyle}
        className="share-slider min-w-0 flex-1 scroll-mt-28 lg:scroll-mt-12"
      />
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={FULL_SHARE / 100}
          step={0.01}
          value={value / 100}
          onChange={(event) => update(event.target.valueAsNumber)}
          className="min-h-11 w-[5.5rem] scroll-mt-28 rounded-xs lg:scroll-mt-12 border border-hairline bg-canvas px-2 text-right lg:min-h-0 lg:py-1.5 text-caption tabular-nums"
        />
        <span aria-hidden="true" className="text-caption text-ink-muted-80">
          %
        </span>
      </div>
    </div>
  );
}
