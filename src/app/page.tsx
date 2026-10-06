import { headers } from "next/headers";
import { DhondtExample } from "@/components/home/dhondt-example";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/home-hero";
import { SeatContrast } from "@/components/home/seat-contrast";
import { SiteHeader } from "@/components/home/site-header";
import { auth } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const username = session?.user.name;
  return (
    <>
      <SiteHeader username={username} />
      <main className="flex-1">
        <HomeHero username={username} />
        <SeatContrast />
        <DhondtExample />
        <HomeClosing />
      </main>
    </>
  );
}
