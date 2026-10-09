"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { notify } from "@/components/feedback/notify";
import { exceedsShareUrlLimit, withScenarioParam } from "@/lib/scenario/url";
import { ShareLink } from "./share-link";

// The address changes only with `scenarioParam`, which already re-renders.
const subscribeNever = () => () => {};

// FR-10: copies the current address, which always holds the scenario.
export function ShareLinkContainer({ brokenLink, scenarioParam }: { brokenLink: boolean; scenarioParam: string | null }) {
  const [copied, setCopied] = useState(false);
  const currentShareUrl = () => withScenarioParam(window.location.href, scenarioParam);
  // The address is only known in the browser; the server renders no warning.
  const longUrl = useSyncExternalStore(subscribeNever, () => exceedsShareUrlLimit(currentShareUrl()), () => false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentShareUrl());
      setCopied(true);
      notify.success({ title: "Enlace copiado", description: "Quien lo abra verá esta misma simulación." });
    } catch {
      notify.error({ title: "No se ha podido copiar", description: "Copia la dirección desde la barra del navegador." });
    }
  };
  return <ShareLink brokenLink={brokenLink} longUrl={longUrl} copied={copied} onCopy={copy} />;
}
