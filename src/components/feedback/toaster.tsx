"use client";

import { Toaster as SileoToaster } from "sileo";
import { STATUS_ID } from "./notify";

// One toaster for the whole site: a dark ink pill at the bottom, clear of
// the sticky results strip and share budget at the top on small screens.
// State colours and type live in globals.css.
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
