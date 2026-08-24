import type { MetadataRoute } from "next";
import { blogPosts } from "./data/blogPosts";

const BASE_URL = "https://aviatour.travel";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/travel-blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((post) => ({ url: `${BASE_URL}/travel-blog/${post.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
