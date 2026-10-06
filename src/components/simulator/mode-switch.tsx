export type InputMode = "national" | "province";

const MODES: readonly { mode: InputMode; label: string }[] = [
  { mode: "national", label: "Nacional" },
  { mode: "province", label: "Por provincia" },
];

// D-02: both modes edit the same scenario; this only picks the editor.
export function ModeSwitch({ mode, onChange }: { mode: InputMode; onChange: (mode: InputMode) => void }) {
  return (
    <div role="group" aria-label="Modo de simulación" className="flex rounded-full border border-hairline p-1">
      {MODES.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          onClick={() => onChange(option.mode)}
          className="min-h-11 flex-1 rounded-full px-4 text-caption font-semibold transition-colors aria-pressed:bg-ink aria-pressed:text-on-dark motion-reduce:transition-none"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
