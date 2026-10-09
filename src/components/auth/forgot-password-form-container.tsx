"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { requestPasswordReset } from "@/lib/auth/actions";
import { ForgotPasswordForm } from "./forgot-password-form";

export function ForgotPasswordFormContainer() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref}>
      <ForgotPasswordForm state={state} action={action} pending={pending} />
    </div>
  );
}
