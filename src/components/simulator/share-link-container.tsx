"use client";

import { useEffect, useState } from "react";
import { notify } from "@/components/feedback/notify";
import { withScenarioParam } from "@/lib/scenario/address";
import { shortenScenario } from "@/lib/short-links/actions";
import { ShareLink } from "./share-link";

// FR-10: copies a short link to the scenario, or the full address if it cannot get one.
export function ShareLinkContainer({ brokenLink, scenarioParam }: { brokenLink: boolean; scenarioParam: string | null }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timer);
  }, [copied]);
  const shareUrl = async () => {
    const id = scenarioParam ? await shortenScenario(scenarioParam).catch(() => null) : null;
    return id ? new URL(`/l/${id}`, window.location.origin).href : withScenarioParam(window.location.href, scenarioParam);
  };
  const copy = async () => {
    try {
      // Safari only copies within the click, so the item waits for the address instead.
      const text = shareUrl().then((url) => new Blob([url], { type: "text/plain" }));
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": text })]);
      setCopied(true);
      notify.success({ title: "Enlace copiado", description: "Quien lo abra verá esta misma simulación." });
    } catch {
      notify.error({ title: "No se ha podido copiar", description: "Copia la dirección desde la barra del navegador." });
    }
  };
  return <ShareLink brokenLink={brokenLink} copied={copied} onCopy={copy} />;
}
