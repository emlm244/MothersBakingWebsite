"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@data";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@ui";
import { useCart } from "@/features/cart/hooks";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <Badge>Macaron</Badge>
        <CardTitle>{product.name}</CardTitle>
        {product.subtitle ? <CardDescription>{product.subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-cream">
          <Image
            src={product.images[0] ?? ""}
            alt={`${product.name} macaron art`}
            width={480}
            height={320}
            className="h-auto w-full"
            unoptimized
          />
        </div>
        <p className="text-sm text-brown/70">{product.descriptionMd.split("\n")[0]}</p>
        <div className="flex items-center justify-between">
          <p className="font-brand text-xl text-brown">${(product.priceCents / 100).toFixed(2)}</p>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/shop/${product.slug}`}>View</Link>
            </Button>
            <Button size="sm" onClick={() => add(product.id, 1)}>
              Add to cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
