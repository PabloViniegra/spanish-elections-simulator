"use client";

import { useRef, useState } from "react";
import { cssVar } from "@/lib/css-var";
import { HEMICYCLE_HEIGHT, HEMICYCLE_WIDTH } from "@/lib/hemicycle-layout";
import { chamberGroups, chamberSeats, nearestGroup } from "@/lib/senate/chamber";

const PAD = 12;
const REACH = 9;
const DESIGNATED_PAUSE = 120;
const LAST = chamberGroups.length - 1;
const FIRST_DESIGNATED = chamberGroups.findIndex(({ elected }) => !elected);
const next = (current: number) => Math.min(current + 1, LAST);
const previous = (current: number) => Math.max(current - 1, 0);
const STEPS = new Map([
  ["ArrowRight", next],
  ["ArrowDown", next],
  ["ArrowLeft", previous],
  ["ArrowUp", previous],
  ["Home", () => 0],
  ["End", () => LAST],
  ["PageUp", () => 0],
  ["PageDown", () => FIRST_DESIGNATED],
]);

function describe(group: number | null) {
  if (group === null) return { name: "Elige un escaño", detail: "y verás de dónde sale ese senador" };
  const { name, seats, elected } = chamberGroups[group];
  const count = `${seats} ${seats === 1 ? "senador" : "senadores"}`;
  return { name, detail: elected ? `${count} ${seats === 1 ? "elegido" : "elegidos"} en las urnas` : `${count} que nombra su parlamento` };
}

function seatClass(elected: boolean, lit: boolean, dimmed: boolean) {
  if (elected) return lit ? "fill-action-blue" : dimmed ? "fill-on-dark/25" : "fill-on-dark";
  return lit ? "fill-action-blue/30 stroke-action-blue" : dimmed ? "fill-transparent stroke-on-dark/25" : "fill-transparent stroke-on-dark/70";
}

export function SenateChamber() {
  const [active, setActive] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { name, detail } = describe(active);

  const pick = (event: React.PointerEvent) => {
    const matrix = svg.current?.getScreenCTM()?.inverse();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    const group = nearestGroup(point.x, point.y, REACH);
    if (group !== undefined) setActive(group);
  };

  const step = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") return setActive(null);
    const move = STEPS.get(event.key);
    if (!move) return;
    event.preventDefault();
    setActive((current) => move(current ?? -1));
  };

  return (
    <div className="relative w-full">
      <div
        role="group"
        tabIndex={0}
        aria-label="Hemiciclo del Senado. Usa las flechas para recorrer circunscripciones y comunidades; Re Pág y Av Pág saltan entre electos y designados."
        onKeyDown={step}
        className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <svg
          ref={svg}
          viewBox={`${-PAD} ${-PAD} ${HEMICYCLE_WIDTH + 2 * PAD} ${HEMICYCLE_HEIGHT + PAD}`}
          aria-hidden="true"
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
          className="w-full cursor-crosshair touch-pan-y"
        >
          {chamberSeats.map(({ x, y, order, group }) => {
            const { elected } = chamberGroups[group];
            return (
              <circle
                key={order}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r={elected ? 3 : 2.5}
                strokeWidth={elected ? 0 : 1.5}
                style={cssVar("--i", elected ? order : order + DESIGNATED_PAUSE)}
                className={`seat-in transition-[fill,stroke] duration-200 ease-[ease] ${seatClass(elected, group === active, active !== null && group !== active)}`}
              />
            );
          })}
        </svg>
      </div>
      <p
        aria-live="polite"
        className="pointer-events-none mt-4 flex flex-col items-center text-center sm:absolute sm:inset-x-0 sm:bottom-0 sm:mx-auto sm:mt-0 sm:w-[30%]"
      >
        <span className={`text-tagline font-semibold text-balance ${active === null ? "text-on-dark-muted" : "text-on-dark"}`}>{name}</span>
        <span className="text-caption text-balance text-on-dark-muted">{detail}</span>
      </p>
    </div>
  );
}
