import Link from "next/link";
import { HemicycleGlyph } from "@/components/brand/hemicycle-glyph";

const pill = "inline-flex min-h-11 items-center justify-center rounded-full transition-[background-color,scale] duration-200 ease-snappy active:scale-[0.97]";

const sizes = {
  default: "gap-2 px-[22px] py-[11px] text-body",
  hero: "gap-2 px-7 py-3.5 text-button-lg font-medium",
};

const tones = {
  light: { primary: "bg-primary text-on-primary hover:bg-primary-focus", ghost: "border-primary text-primary hover:bg-primary/8" },
  dark: { primary: "bg-action-blue text-ink hover:bg-action-blue-hover", ghost: "border-primary-on-dark text-primary-on-dark hover:bg-primary-on-dark/12" },
  blue: { primary: "bg-canvas text-primary hover:bg-surface-pearl", ghost: "border-on-primary text-on-primary hover:bg-on-primary/12" },
};

export function CtaLinks({ tone = "light", withLogin = true, size = "default" }: { tone?: keyof typeof tones; withLogin?: boolean; size?: keyof typeof sizes }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/simulator" className={`${pill} group/cta ${sizes[size]} ${tones[tone].primary}`}>
        Abrir el simulador
        <HemicycleGlyph />
      </Link>
      {withLogin && (
        <Link href="/login" className={`${pill} ${sizes.default} border ${tones[tone].ghost}`}>
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
