import Link from "next/link";
import { CtaLinks } from "../../home/cta-links";
import { closingTitle } from "../../home/type";
import { SiteFooter } from "../../layout/site-footer";

export function SenateClosing() {
  return (
    <>
      <section aria-labelledby="senate-closing-title" className="rise-scope bg-primary text-on-primary [&_:focus-visible]:outline-on-primary">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-5 py-section text-center sm:px-8 lg:py-32">
          <h2 id="senate-closing-title" className={`rise [--c:0] ${closingTitle}`}>
            El Gobierno se decide en el Congreso
          </h2>
          <p className="rise max-w-[34rem] text-body text-pretty [--c:1]">
            La investidura la vota solo el Congreso. El simulador reparte sus 350 escaños con las reglas que se explican en{" "}
            <Link href="/how-it-works" className="underline underline-offset-2">
              cómo funciona el Congreso
            </Link>
            .
          </p>
          <div className="rise [--c:2]">
            <CtaLinks tone="blue" withLogin={false} />
          </div>
        </div>
      </section>
      <SiteFooter>
        Basado en la{" "}
        <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229" className="underline underline-offset-2">
          Constitución
        </a>{" "}
        (artículo 69), la{" "}
        <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672" className="underline underline-offset-2">
          Ley Orgánica del Régimen Electoral General
        </a>{" "}
        (artículos 96, 165 y 166) y los resultados oficiales del Ministerio del Interior.
      </SiteFooter>
    </>
  );
}
