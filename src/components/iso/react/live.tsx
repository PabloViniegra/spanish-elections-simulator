"use client";

import * as React from "react";

const STILLNESS = "(prefers-reduced-motion: reduce)";
const MARGIN = "120px 0px";
const LONGEST_FRAME = 1 / 30;

export const asksForStillness = () => window.matchMedia(STILLNESS).matches;

export function useStillness() {
  return React.useSyncExternalStore(
    (changed) => {
      const query = window.matchMedia(STILLNESS);
      query.addEventListener("change", changed);
      return () => query.removeEventListener("change", changed);
    },
    asksForStillness,
    () => false,
  );
}

export function useInView<T extends Element>(ref: React.RefObject<T | null>, onChange?: (inView: boolean) => void) {
  const [inView, setInView] = React.useState(false);
  const changed = React.useRef(onChange);
  React.useLayoutEffect(() => {
    changed.current = onChange;
  });
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const binding = new IntersectionObserver((entries) => {
      const visible = Boolean(entries.at(-1)?.isIntersecting);
      setInView(visible);
      changed.current?.(visible);
    }, { rootMargin: MARGIN });
    binding.observe(node);
    return () => binding.disconnect();
  }, [ref]);
  return inView;
}

export function useLoop(tick: (dt: number, calm: boolean) => boolean, running: boolean) {
  const latest = React.useRef(tick);
  React.useLayoutEffect(() => {
    latest.current = tick;
  });
  const frame = React.useRef(0);
  const last = React.useRef(0);
  const kick = React.useCallback(() => {
    if (frame.current) return;
    last.current = 0;
    const step = (now: number) => {
      const dt = last.current ? Math.min((now - last.current) / 1000, LONGEST_FRAME) : 1 / 60;
      last.current = now;
      const more = latest.current(dt, asksForStillness());
      frame.current = more ? requestAnimationFrame(step) : 0;
    };
    frame.current = requestAnimationFrame(step);
  }, []);
  React.useEffect(() => {
    if (running) kick();
    else {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [running, kick]);
  return kick;
}

export function follow(current: number, target: number, dt: number, seconds: number, calm = false) {
  if (calm) return target;
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds));
  return Math.abs(target - next) < 1e-3 ? target : next;
}
