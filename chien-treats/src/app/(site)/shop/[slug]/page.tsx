"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  TextArea,
  Label,
} from "@ui";
import { useProduct } from "@/features/products/useProduct";
import { useCart } from "@/features/cart/hooks";
import { useReviews } from "@/features/reviews/useReviews";
import { useSubmitReview } from "@/features/reviews/useSubmitReview";
import { formatIsoDate } from "@/lib/utils";
import { ReviewCard } from "@/components/review-card";

const reviewSchema = z.object({
  userName: z.string().min(2, "Please share your name"),
  email: z.string().email("Enter a valid email"),
  rating: z.number().min(1).max(5),
  title: z.string().max(80).optional(),
  body: z.string().min(20, "Let other dessert lovers know what you enjoyed"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { product, loading } = useProduct(params?.slug);
  const { reviews } = useReviews(product?.id, "approved");
  const { add } = useCart();
  const { submit, submitting, success, error } = useSubmitReview(product?.id ?? null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userName: "",
      email: "",
      rating: 5,
      title: "",
      body: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!product) return;
    await submit(values);
    if (!error) {
      form.reset({ userName: "", email: "", rating: 5, title: "", body: "" });
    }
  });

  if (loading) {
    return <p className="text-brown/70">Loading product...</p>;
  }

  if (!product) {
    return <p className="text-brown/70">We could not find that flavor. Head back to the shop.</p>;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <Image
            src={product.images[0] ?? ""}
            alt={`${product.name} graphic`}
            width={640}
            height={480}
            className="h-auto w-full rounded-2xl"
            unoptimized
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>Macaron</Badge>
            <h1 className="font-brand text-4xl text-brown">{product.name}</h1>
            {product.subtitle ? <p className="text-brown/70">{product.subtitle}</p> : null}
          </div>
          <p className="whitespace-pre-line text-brown/80">{product.descriptionMd}</p>
          <div className="space-y-2 text-sm text-brown/70">
            {product.allergens ? (
              <p>
                <strong>Allergens:</strong> {product.allergens.join(", ")}
              </p>
            ) : null}
            {product.nutrition ? (
              <p>
                <strong>Nutrition (per shell):</strong>{" "}
                {Object.entries(product.nutrition)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(" - ")}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-brand text-3xl text-brown">${(product.priceCents / 100).toFixed(2)}</span>
            <Button size="lg" onClick={() => add(product.id, 1)}>
              Add to cart
            </Button>
            <span className="text-sm text-brown/60">Ships within Seattle or pickup in Capitol Hill studio.</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <div>
            <h2 className="font-brand text-2xl text-brown">Customer love</h2>
            <p className="text-sm text-brown/70">Approved reviews appear here after moderation.</p>
          </div>
          {reviews.length ? (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No reviews yet</CardTitle>
                <CardDescription>Be the very first to share how this flavor made your celebration special.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Share your experience</CardTitle>
            <CardDescription>We moderate every review to keep the space kind and helpful.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" {...form.register("userName")} />
                {form.formState.errors.userName ? (
                  <p className="text-sm text-red" role="alert">
                    {form.formState.errors.userName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-sm text-red" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" min={1} max={5} {...form.register("rating", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Headline (optional)</Label>
                <Input id="title" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Review</Label>
                <TextArea id="body" rows={5} {...form.register("body")} />
                {form.formState.errors.body ? (
                  <p className="text-sm text-red" role="alert">
                    {form.formState.errors.body.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit review"}
              </Button>
              {success ? <p className="text-sm text-green-700">Thank you! Your review is pending moderation.</p> : null}
              {error ? <p className="text-sm text-red">{error}</p> : null}
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-brand text-2xl text-brown">Flavor timeline</h2>
        <ul className="mt-4 space-y-2 text-sm text-brown/70">
          <li>Created {formatIsoDate(product.createdAt)}</li>
          <li>Last updated {formatIsoDate(product.updatedAt)}</li>
          <li>Tags: {product.tags.join(", ") || "coming soon"}</li>
        </ul>
      </section>
    </div>
  );
}
