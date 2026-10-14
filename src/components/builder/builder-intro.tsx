import Image from "next/image";
import tallySheet from "@/assets/images/tally-sheet.webp";
import { sectionTitle } from "@/components/home/type";

export function BuilderIntro() {
  return (
    <div className="bg-canvas-parchment">
      <div className="mx-auto grid max-w-content items-center gap-8 px-5 pt-14 pb-12 sm:px-8 lg:grid-cols-[3fr_2fr] lg:gap-12 lg:pt-20 lg:pb-16">
        <div className="flex flex-col gap-3">
          <h1 className={`hero-rise [--c:0] ${sectionTitle}`}>Construye unas elecciones</h1>
          <p className="hero-rise max-w-[60ch] text-lead-airy text-ink-muted-80 [--c:1]">
            Elige los partidos y el reparto de escaños. Después irás provincia a provincia escribiendo los votos y verás cómo se reparten los escaños.
          </p>
          <p className="hero-rise text-caption text-ink-muted-80 [--c:2]">Son unas elecciones construidas a mano, no una previsión.</p>
        </div>
        <div className="relative hidden aspect-[3/2] w-full max-w-80 justify-self-center sm:block lg:max-w-md">
          <Image
            src={tallySheet}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 639px) 0px, (max-width: 1023px) 320px, (max-width: 1231px) calc(40vw - 45px), 448px"
            className="object-contain mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}
