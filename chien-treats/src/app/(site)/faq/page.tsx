"use client";

import { useContentBlock } from "@/features/content/useContentBlocks";

export default function FaqPage() {
  const block = useContentBlock("faq");

  const entries = block
    ? block.bodyMd.split(/\n\n+/).map((chunk) => {
        const [question, ...rest] = chunk.split("? ");
        return {
          question: question.replace(/^\*\*/g, "").replace(/\*\*$/g, "") + (question.endsWith("?") ? "" : "?"),
          answer: rest.join("? ") || "We'll update this soon!",
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-4xl text-brown">Frequently asked questions</h1>
        <p className="text-brown/70">We love curious bakers. Reach support anytime from the contact form.</p>
      </header>
      <div className="space-y-4">
        {entries.length ? (
          entries.map((item, index) => (
            <details key={index} className="rounded-2xl border border-brown/15 bg-white p-4 shadow-soft">
              <summary className="cursor-pointer font-semibold text-brown">{item.question}</summary>
              <p className="mt-3 text-sm text-brown/70">{item.answer}</p>
            </details>
          ))
        ) : (
          <p className="text-brown/70">Loading sweet answers...</p>
        )}
      </div>
    </div>
  );
}
