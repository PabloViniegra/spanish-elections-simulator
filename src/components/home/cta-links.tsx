import Link from "next/link";

const pill = "inline-flex min-h-11 items-center rounded-full px-[22px] py-[11px] text-body transition-[translate,scale,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-product active:translate-y-0 active:scale-[0.97] motion-reduce:hover:translate-y-0";

const tones = {
  light: { primary: "bg-primary text-on-primary", ghost: "border-primary text-primary" },
  dark: { primary: "bg-primary text-on-primary", ghost: "border-primary-on-dark text-primary-on-dark" },
  blue: { primary: "bg-canvas text-primary", ghost: "border-on-primary text-on-primary" },
};

export function CtaLinks({ tone = "light" }: { tone?: keyof typeof tones }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/register" className={`${pill} ${tones[tone].primary}`}>
        Crear cuenta
      </Link>
      <Link href="/login" className={`${pill} border ${tones[tone].ghost}`}>
        Iniciar sesión
      </Link>
    </div>
  );
}
