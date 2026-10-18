import Link from "next/link";
import type { ComponentProps } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import type { SignUpValues } from "@/lib/auth/forms";
import { usageProfileLabels } from "@/lib/auth/usage-profiles";
import { CONTROLLER_NAME } from "@/lib/legal";
import { provinces } from "@/lib/provinces";

const provinceOptions = [
  { value: "", label: "Prefiero no indicarla" },
  ...provinces.map(({ code, name }) => ({ value: code, label: name })),
];

const usageProfileOptions = Object.entries(usageProfileLabels).map(([value, label]) => ({ value, label }));

type RegisterFormProps = {
  register: UseFormRegister<SignUpValues>;
  errors: FieldErrors<SignUpValues>;
  onSubmit: ComponentProps<"form">["onSubmit"];
  error?: string;
  pending: boolean;
};

export function RegisterForm({ register, errors, onSubmit, error, pending }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label="Nombre de usuario"
        {...register("username")}
        hint="Entre 3 y 30 caracteres: letras, números, punto o guion bajo."
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        minLength={3}
        maxLength={30}
        pattern="[a-zA-Z0-9_.]+"
        error={errors.username?.message}
      />
      <TextField
        label="Correo electrónico"
        {...register("email")}
        type="email"
        autoComplete="email"
        spellCheck={false}
        autoCapitalize="none"
        required
        error={errors.email?.message}
      />
      <PasswordField
        label="Contraseña"
        {...register("password")}
        hint="Mínimo 8 caracteres."
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={errors.password?.message}
      />
      <PasswordField
        label="Confirmar contraseña"
        {...register("confirmPassword")}
        hint="Repite la contraseña anterior."
        autoComplete="new-password"
        required
        maxLength={128}
        error={errors.confirmPassword?.message}
      />
      <details open={Boolean(errors.province || errors.usageProfile)}>
        <summary className="flex min-h-11 cursor-pointer items-center px-1 text-caption text-primary">
          Añadir detalles (opcional)
        </summary>
        <div className="flex flex-col gap-5 pt-2">
          <p className="px-1 text-caption text-ink-muted-80">
            Nunca guardamos tu afiliación política ni tu intención de voto.
          </p>
          <SelectField
            label="Provincia (opcional)"
            {...register("province")}
            options={provinceOptions}
            error={errors.province?.message}
          />
          <SelectField
            label="Perfil de uso"
            hint="Cuéntanos cómo vas a usar el simulador."
            {...register("usageProfile")}
            options={usageProfileOptions}
            error={errors.usageProfile?.message}
          />
        </div>
      </details>
      <p className="px-1 text-caption text-pretty text-ink-muted-80">
        Al crear la cuenta confirmas que tienes al menos 14 años. Responsable: {CONTROLLER_NAME}. Finalidad: gestionar tu
        cuenta y guardar tus simulaciones. Puedes acceder a tus datos, rectificarlos, borrarlos y ejercer tus demás
        derechos. Más información en la{" "}
        <Link href="/privacy" className="text-primary underline">
          política de privacidad
        </Link>
        .
      </p>
      <FormAlert message={error} />
      <SubmitButton pending={pending} label="Crear cuenta" pendingLabel="Creando cuenta…" />
    </form>
  );
}
