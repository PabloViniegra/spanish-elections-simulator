type Option = { code: string; name: string };

type MachineControlsProps = {
  provinces: Option[];
  code: string;
  step: number;
  total: number;
  playing: boolean;
  onProvince: (code: string) => void;
  onStep: (step: number) => void;
  onToggle: () => void;
};

const button =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink shadow-[0_0_0_1px_var(--color-hairline)] transition-colors hover:bg-divider-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-blue disabled:opacity-40";

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 fill-current">
      <path d={d} />
    </svg>
  );
}

export function MachineControls({ provinces, code, step, total, playing, onProvince, onStep, onToggle }: MachineControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <label className="flex min-w-0 items-center gap-3 text-caption text-ink-muted-80">
        Provincia
        <select
          value={code}
          onChange={(event) => onProvince(event.target.value)}
          className="min-w-0 flex-1 rounded-sm bg-canvas px-3 py-2 text-caption text-ink shadow-[0_0_0_1px_var(--color-hairline)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-blue sm:w-52 sm:flex-none"
        >
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-1 items-center gap-2">
        <button type="button" className={button} onClick={() => onStep(step - 1)} disabled={step === 0} aria-label="Escaño anterior">
          <Glyph d="M4 3h1.6v10H4zM12 3v10L6 8z" />
        </button>
        <button type="button" className={button} onClick={onToggle} aria-label={playing ? "Pausar" : step === total ? "Repetir el reparto" : "Repartir"}>
          <Glyph d={playing ? "M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" : "M5 3v10l8-5z"} />
        </button>
        <button type="button" className={button} onClick={() => onStep(step + 1)} disabled={step === total} aria-label="Escaño siguiente">
          <Glyph d="M10.4 3H12v10h-1.6zM4 3v10l6-5z" />
        </button>
        <input
          type="range"
          min={0}
          max={total}
          value={step}
          onChange={(event) => onStep(Number(event.target.value))}
          aria-label="Escaños repartidos"
          aria-valuetext={`${step} de ${total} escaños`}
          className="ml-2 h-6 min-w-0 flex-1 accent-ink"
        />
        <span className="w-14 shrink-0 text-right text-caption text-ink-muted-80 tabular-nums">
          {step}/{total}
        </span>
      </div>
    </div>
  );
}
