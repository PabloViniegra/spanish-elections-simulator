"use client";

import { useEffect, useRef, useState } from "react";

// Below sm the bar only fits the brand, so the destinations and the account
// live in this panel. Any link or button inside closes it.
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 text-caption"
      >
        Menú
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-2">
          <path
            d="M2 5h12"
            strokeLinecap="round"
            className={`origin-center transition-transform duration-300 ease-snappy [transform-box:fill-box] motion-reduce:duration-0 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <path
            d="M2 11h12"
            strokeLinecap="round"
            className={`origin-center transition-transform duration-300 ease-snappy [transform-box:fill-box] motion-reduce:duration-0 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </svg>
      </button>
      {open && (
        <div
          id="menu-movil"
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a, button")) setOpen(false);
          }}
          className="menu-panel absolute inset-x-0 top-full z-40 border-y border-white/15 bg-surface-black px-5 pb-3 text-body"
        >
          {children}
        </div>
      )}
    </div>
  );
}
