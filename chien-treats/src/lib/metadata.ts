import type { Metadata } from "next";
import { siteConfig } from "./config";
import { company } from "@/content/site";

export type MetadataParams = {
  title: string;
  description: string;
  path?: string;
  imagePath?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export const absoluteUrl = (path: string) => {
  try {
    return new URL(path, siteConfig.baseUrl).toString();
  } catch {
    return `${siteConfig.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }
};

export const socialImage = (path: string | undefined) =>
  path ? absoluteUrl(path) : absoluteUrl("/brand/coral-hosts-logomark.svg");

export function createMetadata(params: MetadataParams): Metadata {
  const url = params.path ? absoluteUrl(params.path) : siteConfig.baseUrl;

  return {
    metadataBase: new URL(siteConfig.baseUrl),
    title: {
      default: `${params.title} | ${company.name}`,
      template: `%s | ${company.name}`,
    },
    description: params.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      url,
      title: params.title,
      description: params.description,
      type: params.type ?? "website",
      siteName: company.name,
      images: [
        {
          url: socialImage(params.imagePath),
          width: 1200,
          height: 630,
          alt: `${company.name} preview`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [socialImage(params.imagePath)],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
