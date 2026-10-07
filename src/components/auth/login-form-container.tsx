"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { signIn } from "@/lib/auth/actions";
import { LoginForm } from "./login-form";

export function LoginFormContainer({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref}>
      <LoginForm state={state} action={action} pending={pending} next={next} />
    </div>
  );
}
