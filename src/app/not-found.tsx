import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader current="home" />
      <main id="contenido" className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center sm:px-8">
        <p className="text-caption text-ink-muted-80">Error 404</p>
        <h1 className="text-display-md">No encontramos esta página</h1>
        <p className="max-w-md text-body text-pretty text-ink-muted-80">Puede que el enlace esté incompleto o que la página ya no exista. Puedes empezar una nueva simulación o volver al inicio.</p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/simulator" className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-caption font-semibold text-on-primary hover:bg-primary-focus">Ir al simulador</Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-caption underline underline-offset-4">Volver al inicio</Link>
        </div>
      </main>
      <SiteFooter>Es una simulación, no una previsión.</SiteFooter>
    </>
  );
}
