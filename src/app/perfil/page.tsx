import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/site-header";
import { ProfileDetails } from "@/components/profile/profile-details";
import { SimulationList } from "@/components/profile/simulation-list";
import { requireSession } from "@/lib/auth/session";
import { usageProfile, usageProfileLabels } from "@/lib/auth/user-fields";
import { provinces } from "@/lib/provinces";
import { simulatorHref } from "@/lib/scenario/url";
import { listSimulations } from "@/lib/simulations/queries";
import { summarizeSimulation } from "@/lib/simulations/summary";

export const metadata: Metadata = { title: "Mi perfil", robots: { index: false, follow: false } };

const longDate = (date: Date) => date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

export default async function ProfilePage() {
  const { user } = await requireSession("/perfil");
  const saved = await listSimulations(user.id);
  return (
    <>
      <SiteHeader username={user.name} current="perfil" />
      <main id="contenido" className="flex-1">
        <div className="bg-canvas-parchment">
          <div className="mx-auto max-w-content px-5 py-10 sm:px-8">
            <h1 className="text-display-lg text-balance">Mi perfil</h1>
          </div>
        </div>
        <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-start lg:gap-16">
          <ProfileDetails
            username={user.displayUsername ?? user.username ?? user.name}
            email={user.email}
            province={provinces.find(({ code }) => code === user.province)?.name}
            usageProfile={usageProfileLabels[usageProfile.catch("citizen").parse(user.usageProfile)]}
            memberSince={longDate(user.createdAt)}
          />
          <SimulationList
            simulations={saved.map(({ id, name, scenario, createdAt }) => ({
              id,
              name,
              href: simulatorHref(scenario),
              savedOn: longDate(createdAt),
              summary: summarizeSimulation(scenario),
            }))}
          />
        </div>
      </main>
    </>
  );
}
