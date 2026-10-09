import { notFound, permanentRedirect } from "next/navigation";
import { simulatorHref } from "@/lib/scenario/address";
import { findShortLink } from "@/lib/short-links/queries";

// A short link opens its scenario; link previews follow it to the chamber image.
export default async function ShortLinkPage({ params }: PageProps<"/l/[id]">) {
  const scenario = await findShortLink((await params).id);
  if (!scenario) notFound();
  permanentRedirect(simulatorHref(scenario));
}
