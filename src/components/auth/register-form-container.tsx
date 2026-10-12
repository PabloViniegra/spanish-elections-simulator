"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { signUp } from "@/lib/auth/actions";
import { signUpSchema, type FormState, type SignUpValues } from "@/lib/auth/forms";
import { RegisterForm } from "./register-form";

const signUpFields: (keyof SignUpValues)[] = [
  "username", "email", "password", "confirmPassword", "province", "usageProfile",
];

export function RegisterFormContainer({ next }: { next: string }) {
  const { register, handleSubmit, setError, getValues, getFieldState, trigger, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema, undefined, { mode: "sync", raw: true }),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      province: "",
      usageProfile: "citizen",
    },
  });
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, formData) => {
    const result = await signUp(previous, formData);
    for (const name of signUpFields) {
      const message = result?.fieldErrors?.[name];
      if (message) setError(name, { type: "server", message });
    }
    return result;
  }, undefined);
  const ref = useFocusOnError(state);
  const onSubmit = handleSubmit((values) => {
    if (pending) return;
    const formData = new FormData();
    for (const [name, value] of Object.entries(values)) formData.set(name, value);
    formData.set("next", next);
    startTransition(() => action(formData));
  });
  const registerField: typeof register = (name, options) => register(name, name === "password" ? {
    ...options,
    onChange: () => {
      if (getValues("confirmPassword") || getFieldState("confirmPassword").isTouched || formState.isSubmitted) {
        void trigger("confirmPassword");
      }
    },
  } : options);

  return (
    <div ref={ref}>
      <RegisterForm
        register={registerField}
        errors={formState.errors}
        error={state?.error}
        onSubmit={onSubmit}
        pending={pending || formState.isSubmitting}
      />
    </div>
  );
}
