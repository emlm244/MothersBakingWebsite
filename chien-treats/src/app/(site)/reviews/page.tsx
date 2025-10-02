"use client";

import { ReviewCard } from "@/components/review-card";
import { useAllReviews } from "@/features/reviews/useAllReviews";

export default function ReviewsPage() {
  const reviews = useAllReviews("approved");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Sweet words from guests</h1>
        <p className="text-brown/70">We moderate every note to keep feedback kind and actionable.</p>
      </header>
      {reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-brown/70">Reviews are loading...</p>
      )}
    </div>
  );
}
