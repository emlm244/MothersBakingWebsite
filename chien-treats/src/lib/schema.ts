import { caseStudies, company, services } from "@/content/site";
import { siteConfig } from "./config";
import { absoluteUrl } from "./metadata";

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  url: siteConfig.baseUrl,
  logo: absoluteUrl("/brand/coral-hosts-logomark.svg"),
  description: company.description,
  sameAs: company.sameAs,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: company.contacts.sales.email,
      telephone: company.contacts.sales.phone,
      areaServed: "Global",
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "technical support",
      email: company.contacts.support.email,
      telephone: company.contacts.support.phone,
    },
  ],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: company.name,
  url: siteConfig.baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const serviceSchemas = () =>
  services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: {
      "@type": "Organization",
      name: company.name,
    },
    areaServed: "Global",
    serviceType: service.title,
    url: absoluteUrl(`/services#${service.slug}`),
  }));

export const projectSchemas = () =>
  caseStudies.map((study) => ({
    "@context": "https://schema.org",
    "@type": "Project",
    name: study.title,
    description: study.summary,
    url: absoluteUrl(`/projects/${study.slug}`),
    industry: study.industry,
    keywords: study.services.join(", "),
    sponsor: {
      "@type": "Organization",
      name: study.client,
    },
    datePublished: `${study.year}-01-15`,
  }));

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
