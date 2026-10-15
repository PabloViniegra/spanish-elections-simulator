"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { translateAlong } from "@/components/iso/iso-kit";
import { asksForStillness, follow, useInView, useLoop, useStillness } from "@/components/iso/react/live";
import type { Seating } from "./art";
import { format, percent } from "./format";
import { MachineControls } from "./machine-controls";
import { MachineFigure } from "./machine-figure";
import type { ProvinceMachine } from "./model";
import { partsOf } from "./parts";
import { P } from "./view";

const BEAT = 1100;
const TOUR_PAUSE = 4500;
// Provinces the idle tour walks through: large, mid-size and the smallest.
const TOUR = ["28", "08", "41", "46", "33", "42"];

function readoutOf(province: ProvinceMachine, step: number) {
  if (step === 0) return `${province.seats} escaños por repartir`;
  const award = province.awards[step - 1];
  const column = province.columns[award.column];
  return `Escaño ${step} de ${province.seats} · ${column.label} · ${format(column.votes)} ÷ ${award.divisor} = ${format(award.quotient)}`;
}

export function MachineLive({ seats, provinces, initial }: { seats: Seating; provinces: ProvinceMachine[]; initial: string }) {
  const [code, setCode] = useState(initial);
  const province = provinces.find((entry) => entry.code === code) ?? provinces[0];
  const parts = useMemo(() => partsOf(province), [province]);
  const total = province.awards.length;
  const [step, setStep] = useState(total);
  const [playing, setPlaying] = useState(false);
  const running = playing && step < total;
  const [touched, setTouched] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const bar = useRef<SVGGElement>(null);
  const level = useRef(parts.levels[total]);
  const [barAt] = useState(() => translateAlong(P, [0, 0, parts.levels[total]]));
  const started = useRef(false);
  // The first time the figure comes into view it empties and deals again.
  const inView = useInView(stage, (visible) => {
    if (!visible || started.current || asksForStillness()) return;
    started.current = true;
    setStep(0);
    setPlaying(true);
  });
  const still = useStillness();

  const target = parts.levels[step];
  const kick = useLoop((dt, calm) => {
    level.current = follow(level.current, target, dt, 0.32, calm);
    bar.current?.setAttribute("transform", translateAlong(P, [0, 0, level.current]));
    return level.current !== target;
  }, inView);
  useEffect(() => {
    if (still || !inView) level.current = target;
    bar.current?.setAttribute("transform", translateAlong(P, [0, 0, level.current]));
    kick();
  }, [target, still, inView, kick]);

  useEffect(() => {
    if (!running || !inView) return;
    const timer = window.setTimeout(() => setStep(step + 1), step === 0 ? BEAT / 2 : BEAT);
    return () => window.clearTimeout(timer);
  }, [running, inView, step]);

  useEffect(() => {
    if (touched || running || step < total || !inView || still) return;
    const timer = window.setTimeout(() => {
      setCode(TOUR[(TOUR.indexOf(code) + 1) % TOUR.length]);
      setStep(0);
      setPlaying(true);
    }, TOUR_PAUSE);
    return () => window.clearTimeout(timer);
  }, [touched, running, step, total, inView, still, code]);

  useEffect(() => {
    const awarded = new Set(province.awards.slice(0, step).map((award) => award.slot));
    svg.current?.querySelectorAll<SVGGElement>("[data-slot]").forEach((seat) => {
      if (seat.dataset.code !== code) delete seat.dataset.state;
      else seat.dataset.state = awarded.has(Number(seat.dataset.slot)) ? "on" : "wait";
    });
  }, [province, code, step]);

  const goTo = (next: number) => {
    setTouched(true);
    setPlaying(false);
    setStep(Math.min(Math.max(next, 0), total));
  };
  const choose = (next: string) => {
    const chosen = provinces.find((entry) => entry.code === next);
    if (!chosen) return;
    setTouched(true);
    setCode(next);
    setStep(still ? chosen.awards.length : 0);
    setPlaying(!still);
  };
  const toggle = () => {
    setTouched(true);
    if (running) return setPlaying(false);
    if (step >= total) setStep(0);
    setPlaying(true);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const next = new Map([
      ["ArrowRight", step + 1],
      ["ArrowLeft", step - 1],
      ["Home", 0],
      ["End", total],
    ]).get(event.key);
    if (next === undefined) return;
    event.preventDefault();
    goTo(next);
  };

  const readout = readoutOf(province, step);
  const label = `Máquina de reparto con los resultados de julio de 2023 en ${province.name}: ${province.columns
    .filter((column) => column.seats)
    .map((column) => `${column.label}, ${column.seats}`)
    .join("; ")}.`;

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={stage}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-describedby="congress-machine-readout"
        className="relative rounded-lg bg-canvas-parchment px-3 pt-14 pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action-blue sm:px-8 sm:pt-16"
      >
        <p className="absolute top-5 left-5 text-caption font-semibold text-ink sm:top-6 sm:left-8">
          {province.name} <span className="font-normal text-ink-muted-80">· {province.seats} escaños</span>
        </p>
        <MachineFigure seats={seats} parts={parts} step={step} label={label} svgRef={svg} barRef={bar} barAt={barAt} />
        <p
          id="congress-machine-readout"
          aria-live={running ? "off" : "polite"}
          className="mt-1 text-center text-caption text-ink-muted-80 tabular-nums md:absolute md:top-6 md:right-8 md:mt-0 md:text-right"
        >
          {readout}
        </p>
      </div>
      <MachineControls
        provinces={provinces}
        code={code}
        step={step}
        total={total}
        playing={running}
        onProvince={choose}
        onStep={goTo}
        onToggle={toggle}
      />
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-caption text-ink-muted-80">
        {province.columns.map((column) => (
          <li key={column.id} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: column.excluded ? "var(--color-hairline)" : column.colour }} />
            <span className="text-ink">{column.label}</span>
            {percent(column.share)}
            <span className="tabular-nums">{column.excluded ? "· no llega al 3 %" : `· ${column.seats} ${column.seats === 1 ? "escaño" : "escaños"}`}</span>
          </li>
        ))}
        {province.hidden ? <li>y {province.hidden} candidaturas más sin escaño</li> : null}
      </ul>
    </div>
  );
}
