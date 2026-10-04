import { useId, type ReactNode } from "react";

export const controlClassName =
  "h-11 w-full rounded-full border border-hairline bg-canvas px-5 text-body text-ink aria-invalid:border-error";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (control: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="px-1 text-caption font-semibold">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="px-1 text-caption text-ink-muted-80">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="px-1 text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
