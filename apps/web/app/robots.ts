import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Basket and checkout stay crawlable so search engines can see their "noindex" tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
