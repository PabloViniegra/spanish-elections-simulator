import { useId } from "react";

type CsvImportProgressProps = {
  steps: readonly string[];
  // Steps finished so far.
  done: number;
  label: string;
  // Set when the next step failed and can be tried again.
  onRetry?: () => void;
};

// How far a confirmed import has gone, step by step.
export function CsvImportProgress({ steps, done, label, onRetry }: CsvImportProgressProps) {
  const id = useId();
  const failed = onRetry !== undefined;

  return (
    <div className="settle flex min-w-0 flex-col gap-3">
      <p id={id} role="status" className={`text-caption font-semibold ${failed ? "text-error" : ""}`}>
        {label}
      </p>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-valuetext={`Paso ${done} de ${steps.length}: ${steps[done - 1]}`}
        className="h-2 overflow-hidden rounded-full bg-divider-soft"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${failed ? "bg-error" : "bg-primary"}`}
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>
      <ol aria-label="Pasos de la importación" className="flex flex-col gap-1 text-caption">
        {steps.map((step, index) => (
          <li key={step} className={index < done ? "" : "text-ink-muted-80"}>
            <span aria-hidden>{index < done ? "✓ " : failed ? "✕ " : "… "}</span>
            {step}
          </li>
        ))}
      </ol>
      {onRetry && (
        <button type="button" onClick={onRetry} className="min-h-11 w-fit rounded-full border border-ink px-5 text-caption font-semibold">
          Reintentar el guardado
        </button>
      )}
    </div>
  );
}
