import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import type { FormState } from "@/lib/auth/forms";

type LoginFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
};

export function LoginForm({ state, action, pending }: LoginFormProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        label="Usuario o correo electrónico"
        name="identifier"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state?.values?.identifier}
        error={state?.fieldErrors?.identifier}
      />
      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />
      <p className="px-1 text-caption text-ink-muted-80">
        ¿Has olvidado tu contraseña? La recuperación todavía no está disponible.
      </p>
      <FormAlert message={state?.error} />
      <SubmitButton pending={pending} label="Iniciar sesión" pendingLabel="Iniciando sesión…" />
    </form>
  );
}
