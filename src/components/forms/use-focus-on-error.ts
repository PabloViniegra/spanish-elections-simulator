import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/auth/forms";

// After a rejected submit, move focus to the first invalid field, or to the
// form alert, so keyboard and screen-reader users land on the problem.
export function useFocusOnError(state: FormState) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state) return;
    ref.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus();
  }, [state]);
  return ref;
}
