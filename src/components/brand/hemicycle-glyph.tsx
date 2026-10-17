// Rounded so server and client serialise identical attributes (trig results differ in the last digit).
const round = (value: number) => Math.round(value * 1000) / 1000;
const seats = Array.from({ length: 7 }, (_, i) => {
  const angle = Math.PI - (i * Math.PI) / 6;
  return { x: round(11 + 8 * Math.cos(angle)), y: round(11 - 8 * Math.sin(angle)) };
});

export function HemicycleGlyph({ className = "h-3.5 w-[22px]" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 22 14" className={`${className} shrink-0`} fill="currentColor">
      {seats.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r="1.5"
          style={{ transitionDelay: `${i * 35}ms` }}
          className="origin-center opacity-100 transition-[opacity,scale] duration-200 ease-snappy motion-safe:opacity-45 motion-safe:group-hover/cta:scale-110 motion-safe:group-hover/cta:opacity-100 motion-safe:group-focus-visible/cta:opacity-100 motion-safe:group-focus-within/cta:opacity-100"
        />
      ))}
    </svg>
  );
}
