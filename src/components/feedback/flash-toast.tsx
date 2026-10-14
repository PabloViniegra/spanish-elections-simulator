"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { notify } from "./notify";

export function FlashToast({ param, title, description }: { param: string; title: string; description?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Deferred: on a full page load this runs before the toaster subscribes.
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
