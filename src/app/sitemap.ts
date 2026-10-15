import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/how-it-works", "/how-it-works/senate", "/privacy"].map((path) => ({ url: `${SITE_URL}${path}` }));
}
