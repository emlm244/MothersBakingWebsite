"use client";

import { useContentBlock } from "@/features/content/useContentBlocks";

export default function AboutPage() {
  const block = useContentBlock("about");

  return (
    <article className="prose prose-pink max-w-3xl prose-headings:font-brand prose-headings:text-brown">
      <h1>Our story</h1>
      <p className="lead text-brown/70">
        Chien learned to bake beside her grandmother and now brings those warm memories into every small batch.
      </p>
      <div className="space-y-4 text-brown/80">
        {block ? (
          block.bodyMd.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>We are loading our bakery story—check back in a moment.</p>
        )}
      </div>
    </article>
  );
}
