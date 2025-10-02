"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import type { Product } from "@data";
import { createId, toSlug, generateFlavorArt, nowIso } from "@data";

const COLOR_PALETTE = ["#FBD3E9", "#C6FFDD", "#FDEB93", "#A1C4FD", "#F6D365"];

export default function AdminProductsPage() {
  const provider = useDataProvider();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: "", price: 320, description: "", tags: "" });

  const refresh = useCallback(async () => {
    if (!provider) return;
    setLoading(true);
    const list = await provider.listProducts();
    setProducts(list);
    setLoading(false);
  }, [provider]);

  useEffect(() => {
    refresh().catch((err) => setError((err as Error).message));
  }, [refresh]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, name: event.target.value }));
  };

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, price: Number(event.target.value) }));
  };

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, tags: event.target.value }));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, description: event.target.value }));
  };

  async function toggleAvailability(product: Product) {
    if (!provider) return;
    await provider.upsertProduct({ ...product, isAvailable: !product.isAvailable, updatedAt: nowIso() });
    refresh();
  }

  async function updatePrice(product: Product, price: number) {
    if (!provider) return;
    await provider.upsertProduct({ ...product, priceCents: price, updatedAt: nowIso() });
    refresh();
  }

  async function createProduct() {
    if (!provider || !formState.name.trim()) return;
    const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const now = nowIso();
    const product: Product = {
      id: createId("prod"),
      slug: toSlug(formState.name),
      name: formState.name,
      subtitle: `${formState.name} macaron`,
      priceCents: formState.price,
      flavors: [formState.name],
      tags: formState.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isAvailable: true,
      images: [generateFlavorArt(formState.name, color)],
      descriptionMd: formState.description || "Freshly baked shells with classic fillings.",
      nutrition: {
        calories: "110",
        sugar: "12g",
        protein: "2g",
      },
      allergens: ["Almonds", "Egg Whites"],
      createdAt: now,
      updatedAt: now,
    };
    await provider.upsertProduct(product);
    setFormState({ name: "", price: 320, description: "", tags: "" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Products</h1>
        <p className="text-sm text-brown/70">Manage macarons available in the storefront.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Add a product</CardTitle>
          <CardDescription>Generated visuals fill in for photography.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formState.name} onChange={handleNameChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (cents)</Label>
            <Input id="price" type="number" value={formState.price} onChange={handlePriceChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={formState.tags} onChange={handleTagsChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <TextArea id="description" rows={4} value={formState.description} onChange={handleDescriptionChange} />
          </div>
          <div className="md:col-span-2">
            <Button type="button" onClick={createProduct}>Create product</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
          <CardDescription>Toggle availability or adjust pricing inline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-brown/70">Loading products...</p>
          ) : (
            <table className="min-w-full text-sm text-brown/80">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Availability</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-2">
                      <div className="font-semibold text-brown">{product.name}</div>
                      <div className="text-xs text-brown/60">{product.slug}</div>
                    </td>
                    <td className="py-2">
                      <Input
                        type="number"
                        defaultValue={product.priceCents}
                        onBlur={(event: ChangeEvent<HTMLInputElement>) => updatePrice(product, Number(event.target.value))}
                        className="w-24"
                      />
                    </td>
                    <td className="py-2">{product.isAvailable ? "Available" : "Hidden"}</td>
                    <td className="py-2 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleAvailability(product)}>
                        {product.isAvailable ? "Unpublish" : "Publish"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error ? <p className="text-sm text-red">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
