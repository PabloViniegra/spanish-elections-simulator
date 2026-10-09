"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { resetPassword } from "@/lib/auth/actions";
import { ResetPasswordForm } from "./reset-password-form";

export function ResetPasswordFormContainer({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref}>
      <ResetPasswordForm state={state} action={action} pending={pending} token={token} />
    </div>
  );
}
