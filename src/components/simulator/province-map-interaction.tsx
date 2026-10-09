"use client";

import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";
import type { ProvinceSplitProps } from "./province-seats";
import { ProvinceTooltip } from "./province-tooltip";

type ProvinceMapInteractionProps = {
  children: ReactNode;
  province: ProvinceSplitProps["province"] | null;
  hint: string | null;
  onMouseChange: (mouse: boolean) => void;
};

export function ProvinceMapInteraction({ children, province, hint, onMouseChange }: ProvinceMapInteractionProps) {
  const [cursor, setCursor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const frame = useRef<number | null>(null);
  const point = useRef<{ x: number; y: number; target: HTMLDivElement } | null>(null);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);
  const track = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    point.current = { x: event.clientX, y: event.clientY, target: event.currentTarget };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const latest = point.current;
      if (!latest) return;
      const rect = latest.target.getBoundingClientRect();
      setCursor({ x: latest.x - rect.left, y: latest.y - rect.top, width: rect.width, height: rect.height });
    });
  };
  const clear = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    point.current = null;
    setCursor(null);
    onMouseChange(false);
  };
  return (
    <div className="relative" onPointerMove={track} onPointerEnter={(event) => { onMouseChange(event.pointerType === "mouse"); track(event); }} onPointerLeave={clear} onPointerDown={(event) => { if (event.pointerType !== "mouse") clear(); }}>
      {children}
      {cursor && province ? <ProvinceTooltip province={province} {...cursor} hint={hint} /> : null}
    </div>
  );
}
