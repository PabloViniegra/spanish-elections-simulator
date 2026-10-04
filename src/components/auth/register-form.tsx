import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import type { FormState } from "@/lib/auth/forms";
import { provinces } from "@/lib/provinces";

const provinceOptions = [
  { value: "", label: "Prefiero no indicarla" },
  ...provinces.map(({ code, name }) => ({ value: code, label: name })),
];

const usageProfileOptions = [
  { value: "citizen", label: "Uso personal" },
  { value: "journalist", label: "Periodismo o análisis" },
  { value: "teacher", label: "Docencia" },
];

type RegisterFormProps = {
  state: FormState;
  action: (formData: FormData) => void;
  pending: boolean;
};

export function RegisterForm({ state, action, pending }: RegisterFormProps) {
  const values = state?.values;
  const errors = state?.fieldErrors;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        label="Nombre de usuario"
        name="username"
        hint="Entre 3 y 30 caracteres: letras, números, punto o guion bajo."
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        minLength={3}
        maxLength={30}
        pattern="[a-zA-Z0-9_.]+"
        defaultValue={values?.username}
        error={errors?.username}
      />
      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values?.email}
        error={errors?.email}
      />
      <PasswordField
        label="Contraseña"
        name="password"
        hint="Mínimo 8 caracteres."
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={errors?.password}
      />
      <details open={Boolean(errors?.province || errors?.usageProfile)}>
        <summary className="flex min-h-11 cursor-pointer items-center px-1 text-caption text-primary">
          Añadir detalles (opcional)
        </summary>
        <div className="flex flex-col gap-5 pt-2">
          <p className="px-1 text-caption text-ink-muted-80">
            Nunca guardamos tu afiliación política ni tu intención de voto.
          </p>
          <SelectField
            label="Provincia (opcional)"
            name="province"
            options={provinceOptions}
            defaultValue={values?.province ?? ""}
            error={errors?.province}
          />
          <SelectField
            label="Perfil de uso"
            hint="Cuéntanos cómo vas a usar el simulador."
            name="usageProfile"
            options={usageProfileOptions}
            defaultValue={values?.usageProfile ?? "citizen"}
            error={errors?.usageProfile}
          />
        </div>
      </details>
      <FormAlert message={state?.error} />
      <SubmitButton pending={pending} label="Crear cuenta" pendingLabel="Creando cuenta…" />
    </form>
  );
}
