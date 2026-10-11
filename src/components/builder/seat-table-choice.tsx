import type { SeatTable } from "@/lib/builder/types";

const options: { value: SeatTable; label: string; hint: string }[] = [
  { value: "2023", label: "Escaños de 2023", hint: "El reparto por provincia de las elecciones de julio de 2023." },
  { value: "2026", label: "Escaños de 2026", hint: "El reparto del Real Decreto 806/2026 para noviembre de 2026." },
];

type SeatTableChoiceProps = {
  value: SeatTable;
  onChange: (value: SeatTable) => void;
};

export function SeatTableChoice({ value, onChange }: SeatTableChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 px-1 text-caption font-semibold">Escaños por provincia</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-start gap-3 rounded-sm border border-ink-muted-48 px-4 py-3 has-checked:border-ink"
        >
          <input
            type="radio"
            name="seatTable"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 size-4 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="text-body font-semibold">{option.label}</span>
            <span className="text-caption text-ink-muted-80">{option.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
