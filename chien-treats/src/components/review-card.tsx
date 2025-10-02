import type { Review } from "@data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui";
import { formatIsoDate } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          {review.userName}
          <span aria-label={`${review.rating} star rating`} className="text-sm text-yellow">
            {"?".repeat(review.rating)}
          </span>
        </CardTitle>
        <CardDescription>{formatIsoDate(review.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-brown/85">
        {review.title ? <p className="font-semibold text-brown">{review.title}</p> : null}
        <p>{review.body}</p>
      </CardContent>
    </Card>
  );
}
