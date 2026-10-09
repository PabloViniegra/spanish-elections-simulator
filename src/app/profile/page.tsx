import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/site-header";
import { sectionTitle } from "@/components/home/type";
import { DeleteAccountContainer } from "@/components/profile/delete-account-container";
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
const savedAt = (date: Date) => `${longDate(date)}, a las ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })}`;

export default async function ProfilePage() {
  const { user } = await requireSession("/profile");
  const saved = await listSimulations(user.id);
  const username = user.displayUsername ?? user.username ?? user.name;
  return (
    <>
      <SiteHeader username={user.name} current="profile" />
      <main id="contenido" className="flex-1">
        <div className="focus-on-dark bg-surface-black text-on-dark">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 pt-14 pb-12 sm:px-8 lg:pt-20 lg:pb-16">
            <h1 className={`hero-rise [--c:0] ${sectionTitle}`}>Mi perfil</h1>
            <p className="hero-rise text-lead-airy break-words text-on-dark-muted [--c:1]">{username}</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start lg:gap-16 lg:py-16">
          <SimulationList
            simulations={saved.map(({ id, name, scenario, createdAt, updatedAt }) => ({
              id,
              name,
              href: simulatorHref(scenario, id),
              savedOn: savedAt(createdAt),
              updatedOn: updatedAt ? savedAt(updatedAt) : undefined,
              summary: summarizeSimulation(scenario),
            }))}
          />
          <div className="flex flex-col gap-12 lg:sticky lg:top-8">
            <ProfileDetails
              username={username}
              email={user.email}
              province={provinces.find(({ code }) => code === user.province)?.name}
              usageProfile={usageProfileLabels[usageProfile.catch("citizen").parse(user.usageProfile)]}
              memberSince={longDate(user.createdAt)}
            />
            <DeleteAccountContainer />
          </div>
        </div>
      </main>
    </>
  );
}
