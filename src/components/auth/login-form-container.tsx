"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/auth/actions";
import { LoginForm } from "./login-form";

export function LoginFormContainer() {
  const [state, action, pending] = useActionState(signIn, undefined);
  return <LoginForm state={state} action={action} pending={pending} />;
}
