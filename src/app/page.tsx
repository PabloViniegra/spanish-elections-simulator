import { DhondtExample } from "@/components/home/dhondt-example";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/home-hero";
import { SeatContrast } from "@/components/home/seat-contrast";
import { SiteHeader } from "@/components/home/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HomeHero />
        <SeatContrast />
        <DhondtExample />
        <HomeClosing />
      </main>
    </>
  );
}
