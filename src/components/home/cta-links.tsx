import Link from "next/link";

const pill = "inline-flex min-h-11 items-center justify-center rounded-full transition-[background-color,scale] duration-150 ease-snappy active:scale-[0.97]";

// A hero action takes the system's larger rung (DESIGN.md button-large: 18px /
// 300 / 28x14) so it outweighs the ghost; the ghost stays on the default rung
// and is quieted by size as well as by fill.
const sizes = {
  default: "px-[22px] py-[11px] text-body",
  hero: "px-7 py-3.5 text-button-lg",
};

// Tone picks the primary by surface, not by taste: on surface-black it is
// Action Blue (the one accent on dark, and the thing that separates it from
// the white ghost beside it); on an ink band it is the inverted light pill.
const tones = {
  light: { primary: "bg-primary text-on-primary hover:bg-primary-focus", ghost: "border-primary text-primary hover:bg-primary/8" },
  dark: {
    primary: "bg-action-blue text-ink hover:bg-action-blue-hover",
    ghost: "border-primary-on-dark text-primary-on-dark hover:bg-primary-on-dark/12",
  },
  blue: { primary: "bg-canvas text-primary hover:bg-surface-pearl", ghost: "border-on-primary text-on-primary hover:bg-on-primary/12" },
};

export function CtaLinks({ tone = "light", withLogin = true, size = "default" }: { tone?: keyof typeof tones; withLogin?: boolean; size?: keyof typeof sizes }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/simulator" className={`${pill} ${sizes[size]} ${tones[tone].primary}`}>
        Abrir el simulador
      </Link>
      {withLogin && (
        <Link href="/login" className={`${pill} ${sizes.default} border ${tones[tone].ghost}`}>
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
