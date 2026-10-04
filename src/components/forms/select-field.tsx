import type { ComponentProps } from "react";
import { controlClassName, Field } from "./field";

type SelectFieldProps = Omit<ComponentProps<"select">, "id" | "className" | "children"> & {
  label: string;
  hint?: string;
  error?: string;
  options: readonly { value: string; label: string }[];
};

export function SelectField({ label, hint, error, options, ...selectProps }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={`${controlClassName} appearance-none pr-12`}
            {...selectProps}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 12 8"
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-ink stroke-2"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </div>
      )}
    </Field>
  );
}
