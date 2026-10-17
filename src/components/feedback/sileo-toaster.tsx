"use client";

import { useEffect } from "react";
import { Toaster } from "sileo";
import { toasterMounted } from "./notify";

export default function SileoToaster() {
  // Parent effects run after the child's, so Sileo has subscribed by now.
  useEffect(toasterMounted, []);
  return (
    <Toaster
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
  );
}
