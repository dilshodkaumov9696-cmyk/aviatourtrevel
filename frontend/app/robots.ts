import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/book", "/design", "/devspec", "/admin"] },
    sitemap: "https://aviatour.travel/sitemap.xml",
  };
}
