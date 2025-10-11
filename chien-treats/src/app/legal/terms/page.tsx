import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Terms of Service",
  description: "The legal terms governing Coral Hosts managed hosting and consulting engagements.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <div className="prose prose-slate mx-auto max-w-4xl space-y-6 px-4 py-16 md:px-6">
      <h1>Terms of Service</h1>
      <p>Effective date: January 1, 2025</p>
      <h2>1. Engagement</h2>
      <p>
        Coral Hosts LLC ("Coral Hosts") provides managed hosting, operations, and consulting services to the customer ("Client"). The service scope and fees are defined in individual statements of work or service orders.
      </p>
      <h2>2. Responsibilities</h2>
      <ul>
        <li>Coral Hosts maintains the agreed infrastructure, monitoring, and support SLAs.</li>
        <li>Client supplies accurate technical information, access credentials, and a primary contact for escalations.</li>
        <li>Both parties agree to reasonable change control procedures for production-impacting work.</li>
      </ul>
      <h2>3. Availability & SLAs</h2>
      <p>
        Target uptime, response times, and escalation matrices are documented per engagement. Credits for missed SLAs are limited to the monthly service fee.
      </p>
      <h2>4. Security & Compliance</h2>
      <p>
        Coral Hosts implements industry best practices including least-privilege access, encrypted data at rest/in transit, patch management, and continual monitoring. Clients remain responsible for application-level vulnerabilities and user management unless otherwise agreed.
      </p>
      <h2>5. Data Protection</h2>
      <p>
        Each party retains ownership of its data. Coral Hosts processes data solely to provide the services and will not disclose information to third parties except for vetted sub-processors required to deliver the engagement.
      </p>
      <h2>6. Payment</h2>
      <p>Invoices are due within 30 days unless alternate terms are specified. Late payments may incur a 1.5% monthly finance charge.</p>
      <h2>7. Term & Termination</h2>
      <p>
        Either party may terminate with 30 days written notice. Either party may terminate immediately for material breach that remains uncured after written notice.
      </p>
      <h2>8. Liability</h2>
      <p>
        Coral Hosts' aggregate liability is limited to the fees paid in the prior three months. Neither party is liable for indirect or consequential damages.
      </p>
      <h2>9. Confidentiality</h2>
      <p>
        Both parties will protect confidential information using reasonable safeguards and use it solely for fulfilling the engagement.
      </p>
      <h2>10. Governing Law</h2>
      <p>These terms are governed by the laws of the State of California, USA.</p>
      <p>
        Questions? Email <a href="mailto:legal@coralhosts.com">legal@coralhosts.com</a>.
      </p>
    </div>
  );
}
