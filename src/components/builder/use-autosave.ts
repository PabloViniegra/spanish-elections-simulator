import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { saveBuiltDraft } from "@/lib/builder/actions";
import { createDraftSaver, type SaveStatus } from "@/lib/builder/draft-saver";

export type { SaveStatus } from "@/lib/builder/draft-saver";
const DELAY_MS = 1000;

export function useAutosave(id: string, json: string, stored: string) {
  const router = useRouter();
  const [saver] = useState(() => createDraftSaver(json, stored, (next, expected) => saveBuiltDraft(id, next, expected)));
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved" });

  useLayoutEffect(() => {
    saver.subscribe(setStatus);
    return () => saver.subscribe(null);
  }, [saver]);
  useLayoutEffect(() => saver.update(json), [json, saver]);

  useEffect(() => {
    if (!saver.dirty) return;
    const timer = window.setTimeout(() => void saver.flush(), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [json, saver]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saver.dirty) event.preventDefault();
    };
    // Capture before Link's handler so header links are protected as well.
    const navigate = (event: MouseEvent) => {
      if (!saver.dirty || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      void saver.flush().then((saved) => {
        if (saved) router.push(`${url.pathname}${url.search}${url.hash}`);
      });
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", navigate, true);
      // History traversal can unmount without clicking a link; drain rather
      // than cancelling the pending edit with the debounce timer.
      void saver.flush();
    };
  }, [router, saver]);

  return { status, flush: () => { void saver.flush(); } };
}
