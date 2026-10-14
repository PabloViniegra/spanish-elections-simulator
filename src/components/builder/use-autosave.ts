import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { saveBuiltDraft } from "@/lib/builder/actions";
import { createDraftSaver, type SaveStatus } from "@/lib/builder/draft-saver";

export type { SaveStatus } from "@/lib/builder/draft-saver";
const DELAY_MS = 1000;

export function useAutosave(id: string, json: string, revision: number) {
  const router = useRouter();
  const [saver] = useState(() => createDraftSaver(json, revision, (next, current) => saveBuiltDraft(id, next, current)));
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
      // History traversal can unmount without a link click; drain rather than cancel the pending edit.
      void saver.flush();
    };
  }, [router, saver]);

  const save = useCallback(() => saver.flush(), [saver]);
  return { status, flush: () => { void saver.flush(); }, save, discard: () => saver.discard() };
}
