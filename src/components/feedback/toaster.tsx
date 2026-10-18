"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { STATUS_ID, subscribeToasterRequest, toasterRequested } from "./notify";

// Off the critical path: Sileo brings motion, about 46 KB gzipped, so it loads only once a toast is wanted.
const SileoToaster = dynamic(() => import("./sileo-toaster"), { ssr: false });

export function Toaster() {
  const wanted = useSyncExternalStore(subscribeToasterRequest, toasterRequested, () => false);
  return (
    <>
      <p id={STATUS_ID} role="status" className="sr-only" />
      {wanted && <SileoToaster />}
    </>
  );
}
