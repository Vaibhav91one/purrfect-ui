import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/components-data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(); // evaluated at build time: the date of the last deploy
  const page = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority });
  return [page("", 1), page("/components", 0.8), ...COMPONENTS.map((c) => page(`/components/${c.slug}`, 0.7))];
}
