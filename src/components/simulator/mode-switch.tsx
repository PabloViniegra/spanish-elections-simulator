export type InputMode = "national" | "province";

const MODES: readonly { mode: InputMode; label: string }[] = [
  { mode: "national", label: "Nacional" },
  { mode: "province", label: "Por provincia" },
];

// D-02: both modes edit the same scenario; this only picks the editor.
export function ModeSwitch({ mode, onChange }: { mode: InputMode; onChange: (mode: InputMode) => void }) {
  return (
    <div role="group" aria-label="Modo de simulación" className="relative grid grid-cols-2 rounded-full border border-hairline p-1">
      {/* One pill slides under the pressed option instead of two fading. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-ink transition-transform duration-250 ease-in-out motion-reduce:transition-none ${mode === "province" ? "translate-x-full" : ""}`}
      />
      {MODES.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => onChange(option.mode)}
          className="relative min-h-11 rounded-full px-4 text-caption font-semibold transition-[color,scale] duration-150 active:scale-[0.97] aria-pressed:text-on-dark motion-reduce:transition-none"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
