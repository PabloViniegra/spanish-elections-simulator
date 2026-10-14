"use client";

import { useEffect, useState } from "react";
import { notify } from "@/components/feedback/notify";
import { ShareLink } from "@/components/simulator/share-link";
import { shareBuilt } from "@/lib/builder/actions";

export async function builtShortUrl(id: string) {
  const link = await shareBuilt(id);
  if (!link) throw new Error("No short link");
  return new URL(`/l/${link}`, window.location.origin).href;
}

export function BuiltShareContainer({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      // Safari only copies within the click, so the item waits for the address instead.
      const text = builtShortUrl(id).then((url) => new Blob([url], { type: "text/plain" }));
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": text })]);
      setCopied(true);
      notify.success({ title: "Enlace copiado", description: "Quien lo abra verá estas elecciones tal como están ahora." });
    } catch {
      notify.error({ title: "No se ha podido crear el enlace", description: "Vuelve a intentarlo dentro de un rato." });
    }
  };
  return <ShareLink brokenLink={false} copied={copied} onCopy={copy} />;
}
