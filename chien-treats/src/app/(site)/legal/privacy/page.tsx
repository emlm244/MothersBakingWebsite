export default function PrivacyPage() {
  return (
    <article className="prose prose-pink max-w-3xl">
      <h1>Privacy policy</h1>
      <p>We collect the minimum data to fulfill your macaron orders and support requests.</p>
      <h2>What we store</h2>
      <ul>
        <li>Contact details you share in checkout or support tickets</li>
        <li>Order history inside your browser via IndexedDB for demos</li>
      </ul>
      <h2>What we never store</h2>
      <ul>
        <li>Payment methods (Stripe placeholder only)</li>
        <li>Third-party trackers</li>
      </ul>
      <p>Email chien@treats.test for deletion requests.</p>
    </article>
  );
}
