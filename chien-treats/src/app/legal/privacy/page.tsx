import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "How Coral Hosts collects, stores, and uses data submitted through our site and services.",
  path: "/legal/privacy",
});

export default function PrivacyPolicy() {
  return (
    <div className="prose prose-slate mx-auto max-w-4xl space-y-6 px-4 py-16 md:px-6">
      <h1>Privacy Policy</h1>
      <p>Effective date: January 1, 2025</p>
      <p>
        Coral Hosts respects your privacy. This policy explains what information we collect, why we collect it, and how we handle it. We keep this document short on purpose—fewer surprises and easier audits.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Contact details that you submit via forms, live chat, or email.</li>
        <li>Operational metadata required to deliver managed hosting services (IP addresses, request logs, uptime metrics).</li>
        <li>Anonymous analytics on our marketing site to understand aggregate engagement. We do not use third-party ad trackers.</li>
      </ul>
      <h2>How we use information</h2>
      <ul>
        <li>Respond to inquiries and provide proposals.</li>
        <li>Deliver managed hosting, support SLAs, and maintain security controls.</li>
        <li>Send operational updates, maintenance notices, and opt-in newsletters.</li>
      </ul>
      <h2>What we do not do</h2>
      <ul>
        <li>Sell or rent personal data.</li>
        <li>Share customer data outside of vetted sub-processors required to deliver the service.</li>
        <li>Track visitors for advertising networks.</li>
      </ul>
      <h2>Retention</h2>
      <p>
        Contact inquiries are retained for 24 months. Operational logs follow the retention policy defined in your service agreement (default: 35 days for request logs, 12 months for security events).
      </p>
      <h2>Sub-processors</h2>
      <p>
        We rely on trusted providers for infrastructure and operations: Cloudflare, Fly.io, AWS, Google Workspace, Atlassian, PagerDuty, and Linear. Sub-processor agreements include confidentiality and security requirements consistent with ours.
      </p>
      <h2>Your rights</h2>
      <p>
        Email <a href="mailto:privacy@coralhosts.com">privacy@coralhosts.com</a> to access, correct, or delete your information. We respond within 30 days. Customers can also request SOC 2 reports or security questionnaires via their account manager.
      </p>
      <h2>Updates</h2>
      <p>
        We will post updates to this policy on this page and notify active customers 30 days before material changes.
      </p>
    </div>
  );
}
