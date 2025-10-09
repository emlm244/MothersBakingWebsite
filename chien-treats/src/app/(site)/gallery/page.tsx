"use client";

import Image from "next/image";
import { useGallery } from "@/features/gallery/useGallery";

export default function GalleryPage() {
  const items = useGallery();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Macaron gallery</h1>
        <p className="text-brown/70">A playful look at the flavor palettes, custom towers, and seasonal spreads we bake each week.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id} className="space-y-3 rounded-3xl border border-brown/10 bg-white p-4 shadow-soft">
            <Image src={item.image} alt={item.title} width={480} height={320} className="h-auto w-full rounded-2xl" unoptimized />
            <figcaption className="text-sm text-brown/70">
              <strong className="font-brand text-brown">{item.title}</strong>
              {item.description ? <span className="block text-xs text-brown/60">{item.description}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
