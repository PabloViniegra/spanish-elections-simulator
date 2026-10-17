"use client";

import dynamic from "next/dynamic";
import { STATUS_ID } from "./notify";

// Off the critical path: Sileo brings motion, about 46 KB gzipped, to every page.
const SileoToaster = dynamic(() => import("./sileo-toaster"), { ssr: false });

export function Toaster() {
  return (
    <>
      <p id={STATUS_ID} role="status" className="sr-only" />
      <SileoToaster />
    </>
  );
}
