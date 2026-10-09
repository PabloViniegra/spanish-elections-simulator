"use client";

import { useActionState, useState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { deleteAccount } from "@/lib/auth/actions";
import { DeleteAccount } from "./delete-account";

export function DeleteAccountContainer() {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref}>
      <DeleteAccount
        confirming={confirming}
        state={state}
        action={action}
        pending={pending}
        onStart={() => setConfirming(true)}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
