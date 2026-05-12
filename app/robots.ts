import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/console/", "/admin/"],
      },
    ],
    sitemap: `${publicEnv.SITE_URL}/sitemap.xml`,
    host: publicEnv.SITE_URL,
  };
}
