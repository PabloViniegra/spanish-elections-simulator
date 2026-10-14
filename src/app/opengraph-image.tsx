import { chamberImage } from "@/components/og/chamber-image";
import { TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { OG_SIZE } from "@/lib/site";

export const alt = "Así se reparte el Congreso: hemiciclo de 350 escaños con la mayoría absoluta en 176.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return chamberImage({ title: "Así se reparte el Congreso", fills: Array<string>(TOTAL_SEATS).fill("#ffffff") });
}
