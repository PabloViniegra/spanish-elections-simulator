import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import type { FormState } from "@/lib/auth/forms";

type LoginFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
};

export function LoginForm({ state, action, pending }: LoginFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <FormAlert message={state?.error} />
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
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />
      <SubmitButton pending={pending} label="Iniciar sesión" pendingLabel="Iniciando sesión…" />
    </form>
  );
}
