import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/auth/forms";

export function useFocusOnError(state: FormState) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state) return;
    ref.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus();
  }, [state]);
  return ref;
}
