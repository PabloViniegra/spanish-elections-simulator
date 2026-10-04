"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { signUp } from "@/lib/auth/actions";
import { RegisterForm } from "./register-form";

export function RegisterFormContainer() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const ref = useFocusOnError(state);
  // The post-action form reset restores selects to their mount-time default,
  // so remount whenever the server returns different values to refill.
  return (
    <div ref={ref}>
      <RegisterForm
        key={JSON.stringify(state?.values ?? null)}
        state={state}
        action={action}
        pending={pending}
      />
    </div>
  );
}
