import Image from "next/image";
import ballotHand from "@/assets/images/ballot-hand.webp";
import { SiteFooter } from "../layout/site-footer";
import { CtaLinks } from "./cta-links";
import { closingTitle } from "./type";
import { ElectionReference } from "../legal/election-reference";

export function HomeClosing() {
  return (
    <>
      <section aria-labelledby="closing-title" className="rise-scope rise-focus overflow-clip bg-primary text-on-primary [&_:focus-visible]:outline-on-primary">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-5 py-section text-center sm:px-8 lg:py-32">
          <h2 id="closing-title" className={`rise [--c:0] ${closingTitle}`}>
            Prueba con tus propios porcentajes
          </h2>
          <p className="rise max-w-[34rem] text-body text-pretty [--c:1]">
            Con los votos oficiales, reproduce uno a uno los escaños de las cuatro últimas generales.
          </p>
          <div className="rise [--c:2]">
            <CtaLinks tone="blue" withLogin={false} />
          </div>
          <Image
            src={ballotHand}
            alt=""
            placeholder="blur"
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 831px) calc(100vw - 64px), 768px"
            className="zoom-in mt-6 h-auto w-full max-w-3xl mask-x-from-65% mask-y-from-65%"
          />
        </div>
      </section>
      <SiteFooter>
        <ElectionReference /> Aplica la misma ley a todos los partidos.
      </SiteFooter>
    </>
  );
}
