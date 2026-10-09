"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { notify } from "./notify";

// A success toast for the result of a redirect, shown once. The query that
// triggered it is dropped, so reloading the page does not show it again.
export function FlashToast({ title, description }: { title: string; description?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    notify.success({ title, description });
    router.replace(pathname, { scroll: false });
  }, [router, pathname, title, description]);
  return null;
}
