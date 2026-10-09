import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import type { FormState } from "@/lib/auth/forms";

type ForgotPasswordFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
};

export function ForgotPasswordForm({ state, action, pending }: ForgotPasswordFormProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
      />
      <FormAlert message={state?.error} />
      <SubmitButton pending={pending} label="Enviar enlace" pendingLabel="Enviando…" />
    </form>
  );
}
