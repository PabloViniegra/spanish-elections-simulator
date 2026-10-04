"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/auth/actions";
import { RegisterForm } from "./register-form";

export function RegisterFormContainer() {
  const [state, action, pending] = useActionState(signUp, undefined);
  // The post-action form reset restores selects to their mount-time default,
  // so remount whenever the server returns different values to refill.
  return (
    <RegisterForm
      key={JSON.stringify(state?.values ?? null)}
      state={state}
      action={action}
      pending={pending}
    />
  );
}
