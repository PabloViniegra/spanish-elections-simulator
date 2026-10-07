"use client";

import { useState, type ComponentProps } from "react";
import { controlClassName, Field } from "./field";

type PasswordFieldProps = Omit<ComponentProps<"input">, "id" | "className" | "type"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function PasswordField({ label, hint, error, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            autoCapitalize="none"
            spellCheck={false}
            className={`${controlClassName} pr-24`}
            {...inputProps}
          />
          <button
            type="button"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-1 rounded-sm px-4 text-caption text-primary"
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      )}
    </Field>
  );
}
