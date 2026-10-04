import type { ComponentProps } from "react";
import { controlClassName, Field } from "./field";

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, ...inputProps }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={controlClassName}
          {...inputProps}
        />
      )}
    </Field>
  );
}
