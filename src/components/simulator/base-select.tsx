type BaseSelectProps = {
  bases: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
};

// FR-01: the election whose votes the simulation starts from. Seats stay the
// 2026 ones whatever the base. Four fixed options, so all of them stay in view.
export function BaseSelect({ bases, value, onChange }: BaseSelectProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-caption font-semibold">Votos de partida</legend>
      <div className="grid grid-cols-2 gap-2">
        {bases.map((base) => (
          <label key={base.id} className="relative">
            <input
              type="radio"
              name="base"
              value={base.id}
              checked={base.id === value}
              onChange={() => onChange(base.id)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 text-center text-caption font-semibold transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-on-dark peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-focus motion-reduce:transition-none">
              Generales de {base.label}
            </span>
          </label>
        ))}
      </div>
      <p className="text-caption text-ink-muted-80">
        Los escaños por provincia son siempre los de 2026. Cambiar de elección empieza un escenario nuevo.
      </p>
    </fieldset>
  );
}
