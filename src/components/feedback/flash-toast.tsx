"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { notify } from "./notify";

// A success toast for the result of a redirect, shown once. The `param` that
// triggered it is dropped, so reloading the page does not show it again; the
// rest of the query (e.g. where to go after signing in) is kept.
export function FlashToast({ param, title, description }: { param: string; title: string; description?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Deferred: on a full page load this effect runs before the toaster
    // subscribes, which would lose the toast. Cancelled, it never shows twice.
    const timer = window.setTimeout(() => {
      notify.success({ title, description });
      const query = new URLSearchParams(window.location.search);
      query.delete(param);
      const rest = query.toString();
      router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
    });
    return () => window.clearTimeout(timer);
  }, [router, pathname, param, title, description]);
  return null;
}
