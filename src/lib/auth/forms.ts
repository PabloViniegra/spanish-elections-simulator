import { z } from "zod";
import { provinceCode, usageProfile } from "./user-fields";

// Field name → first validation message.
export type FieldErrors = Record<string, string | undefined>;

export type FormState =
  | {
      error?: string;
      fieldErrors?: FieldErrors;
      // Submitted values (never the password) so the form can be refilled.
      values?: Record<string, string>;
    }
  | undefined;

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Introduce tu usuario o correo electrónico."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

// Limits mirror Better Auth's defaults for the username plugin and passwords.
export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(30, "El usuario no puede superar los 30 caracteres.")
    .regex(/^[a-zA-Z0-9_.]+$/, "Usa solo letras, números, punto o guion bajo."),
  email: z.email("Introduce un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede superar los 128 caracteres."),
  province: z.union([z.literal("").transform(() => undefined), provinceCode], {
    error: "Elige una provincia de la lista.",
  }),
  usageProfile: z.enum(usageProfile.options, { error: "Elige un perfil de uso." }),
});

export function fieldErrorsOf(error: z.ZodError) {
  // Reversed so the first issue of each field wins.
  return Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0]), issue.message]).reverse(),
  );
}

// FormData entries are strings for text fields; anything else counts as empty.
const formText = z.string().catch("");

export function formValues(formData: FormData, names: readonly string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, formText.parse(formData.get(name))]));
}

const authErrorMessages = new Map([
  ["INVALID_EMAIL_OR_PASSWORD", "Usuario, correo o contraseña incorrectos."],
  ["INVALID_USERNAME_OR_PASSWORD", "Usuario, correo o contraseña incorrectos."],
  ["USER_ALREADY_EXISTS", "Ya existe una cuenta con ese correo electrónico."],
  ["USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", "Ya existe una cuenta con ese correo electrónico."],
  ["EMAIL_NOT_VERIFIED", "Confirma tu correo electrónico. Te hemos reenviado el enlace."],
  ["USERNAME_IS_ALREADY_TAKEN", "Ese nombre de usuario ya está en uso."],
]);

export function authErrorMessage(code: string | undefined): string {
  return (
    authErrorMessages.get(code ?? "") ??
    "No se ha podido completar la operación. Inténtalo de nuevo."
  );
}
