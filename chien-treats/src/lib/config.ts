import { company } from "@/content/site";

const defaultBaseUrl = "https://coralhosts.com";

export const siteConfig = {
  name: company.name,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || defaultBaseUrl,
  canonicalHost: defaultBaseUrl,
  supportEmail: company.contacts.support.email,
  salesEmail: company.contacts.sales.email,
  phone: company.contacts.sales.phone,
};
