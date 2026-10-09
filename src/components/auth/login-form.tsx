import Link from "next/link";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import type { FormState } from "@/lib/auth/forms";

type LoginFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
  // Where to go once signed in.
  next: string;
};

export function LoginForm({ state, action, pending, next }: LoginFormProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
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
      <Link href="/forgot-password" className="-mt-2 self-start text-caption text-primary underline">
        ¿Has olvidado tu contraseña?
      </Link>
      <FormAlert message={state?.error} />
      <SubmitButton pending={pending} label="Iniciar sesión" pendingLabel="Iniciando sesión…" />
    </form>
  );
}
