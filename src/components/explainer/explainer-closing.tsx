import { SiteFooter } from "../layout/site-footer";
import { CtaLinks } from "../home/cta-links";
import { closingTitle } from "../home/type";
import { ElectionReference } from "../legal/election-reference";

export function ExplainerClosing() {
  return (
    <>
      <section aria-labelledby="explainer-closing-title" className="rise-scope bg-primary text-on-primary [&_:focus-visible]:outline-on-primary">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-5 py-section text-center sm:px-8 lg:py-32">
          <h2 id="explainer-closing-title" className={`rise [--c:0] ${closingTitle}`}>
            Ahora, haz tú
            <br />
            el reparto.
          </h2>
          <p className="rise max-w-[34rem] text-body text-pretty [--c:1]">
            Pon un porcentaje a cada partido y el simulador aplica estas mismas reglas en las 52 circunscripciones.
          </p>
          <div className="rise [--c:2]">
            <CtaLinks tone="blue" withLogin={false} />
          </div>
        </div>
      </section>
      <SiteFooter>
        Basado en la{" "}
        <a href="https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672" className="underline underline-offset-2">
          Ley Orgánica del Régimen Electoral General
        </a>{" "}
        (artículos 96, 162 y 163). <ElectionReference /> Es una explicación divulgativa y no favorece a ningún partido.
      </SiteFooter>
    </>
  );
}
