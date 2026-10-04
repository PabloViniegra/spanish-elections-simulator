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
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={controlClassName}
          {...selectProps}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
