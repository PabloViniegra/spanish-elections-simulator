import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import type { FormState } from "@/lib/auth/forms";

type ResetPasswordFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
  // From the emailed link.
  token: string;
};

export function ResetPasswordForm({ state, action, pending, token }: ResetPasswordFormProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <PasswordField
        label="Contraseña nueva"
        name="password"
        hint="Mínimo 8 caracteres."
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={state?.fieldErrors?.password}
      />
      <FormAlert message={state?.error} />
      <SubmitButton pending={pending} label="Cambiar contraseña" pendingLabel="Cambiando contraseña…" />
    </form>
  );
}
