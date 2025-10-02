"use client";

import { useMemo, useState } from "react";
import { Input, Button, Badge } from "@ui";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/features/products/useProducts";

const TAGS = ["best-seller", "floral", "fruity", "classic", "salty-sweet", "tea"];

export default function ShopPage() {
  const { products, loading } = useProducts();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesTag = tag ? product.tags.includes(tag) : true;
      return matchesSearch && matchesTag && product.isAvailable;
    });
  }, [products, query, tag]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-brand text-4xl text-brown">Shop macarons</h1>
        <p className="text-brown/70">Browse our seasonal flavors and add them to your cozy dessert box.</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search flavors"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="md:w-80"
            aria-label="Search macarons"
          />
          <div className="flex flex-wrap gap-3">
            <Button variant={tag === null ? "primary" : "outline"} size="sm" onClick={() => setTag(null)}>
              All flavors
            </Button>
            {TAGS.map((candidate) => (
              <Button
                key={candidate}
                variant={tag === candidate ? "primary" : "outline"}
                size="sm"
                onClick={() => setTag(candidate)}
              >
                {candidate.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>
      </header>
      {loading ? (
        <p className="text-brown/70">Loading treats...</p>
      ) : filtered.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-brown/15 bg-white p-12 text-center text-brown/70">
          <p>No treats match your filters yet. Try clearing filters or visit custom orders.</p>
        </div>
      )}
      <div className="rounded-3xl bg-cream p-8 shadow-soft">
        <h2 className="font-brand text-2xl text-brown">Flavor tags</h2>
        <p className="mt-3 text-sm text-brown/70">
          Tags help you surface dietary preferences and seasonal notes. More tags can be added in the admin panel.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
