"use client";

import { Toaster as SileoToaster } from "sileo";
import { STATUS_ID } from "./notify";

export function Toaster() {
  return (
    <>
      <p id={STATUS_ID} role="status" className="sr-only" />
      <SileoToaster
        position="bottom-center"
        offset={16}
        theme="light"
        options={{
          fill: "#1d1d1f",
          roundness: 18,
          styles: {
            title: "normal-case! text-caption! font-semibold! text-on-dark!",
            description: "text-caption! text-on-dark-muted!",
            button: "min-h-8! px-3! text-caption! font-semibold!",
          },
        }}
      />
    </>
  );
}
