import type { MetadataRoute } from "next";

const BASE_URL = "https://chienstreats.com";

const ROUTES = [
  "",
  "/shop",
  "/custom-orders",
  "/reviews",
  "/gallery",
  "/about",
  "/visit",
  "/contact",
  "/faq",
  "/support/new",
  "/cart",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
