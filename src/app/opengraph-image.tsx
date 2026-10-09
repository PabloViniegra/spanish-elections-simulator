import { allSeats, chamberImage } from "@/components/og/chamber-image";
import { OG_SIZE } from "@/lib/site";

export const alt = "350 escaños. 52 repartos. Hemiciclo del Congreso con la mayoría absoluta en 176.";
export const size = OG_SIZE;
export const contentType = "image/png";

// The hero's finished count, without the motion.
export default function Image() {
  return chamberImage({ title: "350 escaños. 52 repartos.", fills: allSeats("#ffffff") });
}
