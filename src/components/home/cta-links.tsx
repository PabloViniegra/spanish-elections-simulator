import Link from "next/link";

const pill = "inline-flex min-h-11 items-center rounded-full px-[22px] py-[11px] text-body transition-[background-color,scale] duration-200 ease-snappy active:scale-[0.97]";

const tones = {
  light: { primary: "bg-primary text-on-primary hover:bg-primary-focus", ghost: "border-primary text-primary hover:bg-primary/8" },
  dark: {
    primary: "bg-primary text-on-primary hover:bg-primary-focus",
    ghost: "border-primary-on-dark text-primary-on-dark hover:bg-primary-on-dark/12",
  },
  blue: { primary: "bg-canvas text-primary hover:bg-surface-pearl", ghost: "border-on-primary text-on-primary hover:bg-on-primary/12" },
};

export function CtaLinks({ tone = "light", withLogin = true }: { tone?: keyof typeof tones; withLogin?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/register" className={`${pill} ${tones[tone].primary}`}>
        Crear cuenta
      </Link>
      {withLogin && (
        <Link href="/login" className={`${pill} border ${tones[tone].ghost}`}>
          Iniciar sesión
        </Link>
      )}
    </div>
  );
}
