import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/site";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://coralhosts.com";

const STATIC_ROUTES = [
  "",
  "/services",
  "/projects",
  "/about",
  "/contact",
  "/media-kit",
  "/legal/privacy",
  "/legal/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const projectRoutes = caseStudies.map((project) => `/projects/${project.slug}`);

  return [...STATIC_ROUTES, ...projectRoutes].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
