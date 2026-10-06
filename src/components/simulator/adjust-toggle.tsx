// Off by default: editing a party scales the others so the shares always fit
// in 100% and the seats never go stale. On, the user squares them by hand.
export function AdjustToggle({ free, onChange }: { free: boolean; onChange: (free: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <input
        id="adjust-free"
        type="checkbox"
        checked={free}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby="adjust-free-hint"
        className="mt-0.5 size-5 shrink-0 accent-primary"
      />
      <div className="flex flex-col gap-0.5 text-caption">
        <label htmlFor="adjust-free" className="font-semibold">
          Cuadrar los porcentajes a mano
        </label>
        <p id="adjust-free-hint" className="text-ink-muted-80">
          {free
            ? "Los demás partidos no se mueven. Si pasas del 100 %, verás el último reparto válido."
            : "Al cambiar un partido, los demás se ajustan en proporción para sumar el 100 %."}
        </p>
      </div>
    </div>
  );
}
