import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import type { FormState } from "@/lib/auth/forms";

type DeleteAccountProps = {
  confirming: boolean;
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
  onStart: () => void;
  onCancel: () => void;
};

const linkButton = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

// Deleting the account cannot be undone, so it asks for the password first.
export function DeleteAccount({ confirming, state, action, pending, onStart, onCancel }: DeleteAccountProps) {
  return (
    <section aria-labelledby="eliminar-cuenta" className="flex flex-col gap-3">
      <h2 id="eliminar-cuenta" className="text-tagline">
        Eliminar cuenta
      </h2>
      <p className="text-caption text-ink-muted-80">
        Se borrarán tu cuenta, tus datos y todas tus simulaciones guardadas. No se puede deshacer.
      </p>
      {confirming ? (
        <form action={action} noValidate className="settle flex flex-col gap-4">
          <PasswordField
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            error={state?.fieldErrors?.password}
          />
          <FormAlert message={state?.error} />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-full bg-error px-[22px] py-[11px] text-body text-on-primary transition-[scale,background-color] duration-200 ease-snappy active:scale-[0.97] disabled:bg-ink-muted-48"
            >
              {pending ? "Eliminando cuenta…" : "Eliminar mi cuenta"}
            </button>
            <button type="button" disabled={pending} onClick={onCancel} className={linkButton}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={onStart} className={`${linkButton} w-fit text-error`}>
          Eliminar mi cuenta
        </button>
      )}
    </section>
  );
}
