import { FULL_SHARE } from "@/lib/scenario/types";

type ShareInputProps = {
  id: string;
  label: string;
  // Basis points of national valid votes.
  value: number;
  onChange: (value: number) => void;
};

// No bloc has passed 50% in a general election, so the slider stops there to
// stay precise; the field accepts up to 100%.
const SLIDER_MAX = FULL_SHARE / 2;

// One national share as a slider plus an exact field, both in percent.
export function ShareInput({ id, label, value, onChange }: ShareInputProps) {
  const update = (percent: number) =>
    onChange(Number.isNaN(percent) ? 0 : Math.min(FULL_SHARE, Math.max(0, Math.round(percent * 100))));
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        aria-label={label}
        min={0}
        max={SLIDER_MAX / 100}
        step={0.01}
        value={value / 100}
        onChange={(event) => update(event.target.valueAsNumber)}
        className="min-w-0 flex-1 accent-primary"
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
          className="w-[5.5rem] rounded-xs border border-hairline bg-canvas px-2 py-1.5 text-right text-caption tabular-nums"
        />
        <span aria-hidden="true" className="text-caption text-ink-muted-80">
          %
        </span>
      </div>
    </div>
  );
}
