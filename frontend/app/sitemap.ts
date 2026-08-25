import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

const PAGES = ["", "/think", "/act", "/agents", "/remember", "/authenticate", "/secrets", "/wallet"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
