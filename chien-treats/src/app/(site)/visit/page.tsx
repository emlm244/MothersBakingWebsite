import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@ui";

export const metadata: Metadata = {
  title: "Visit & Hours",
  description: "Plan your visit to Chien's Treats with studio hours, pickup details, and neighborhood tips.",
};

const HOURS: Array<{ label: string; value: string }> = [
  { label: "Monday", value: "10:00 am – 6:00 pm" },
  { label: "Tuesday", value: "10:00 am – 6:00 pm" },
  { label: "Wednesday", value: "10:00 am – 6:00 pm" },
  { label: "Thursday", value: "10:00 am – 6:00 pm" },
  { label: "Friday", value: "10:00 am – 7:00 pm" },
  { label: "Saturday", value: "9:00 am – 5:00 pm" },
  { label: "Sunday", value: "Closed" },
];

export default function VisitPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-brand text-4xl text-brown">Plan your visit</h1>
        <p className="max-w-2xl text-brown/70">
          Our pastel kitchen sits in the heart of Capitol Hill, Seattle. Stop by for limited same-day boxes or schedule
          a pickup for pre-orders and custom celebrations.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Studio hours</CardTitle>
            <CardDescription>We bake Tuesday–Saturday with one prep day for menu planning and recipe testing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-brown/80 sm:grid-cols-2">
            {HOURS.map((entry) => (
              <div key={entry.label}>
                <p className="font-semibold text-brown">{entry.label}</p>
                <p>{entry.value}</p>
              </div>
            ))}
            <p className="sm:col-span-2 text-xs text-brown/60 pt-2">
              Holiday hours and seasonal preorder windows are posted on Instagram @chiens.treats.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Find us</CardTitle>
            <CardDescription>Street-level entrance with wheelchair-accessible counter and pickup window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-brown/80">
            <div>
              <p className="font-semibold text-brown">714 E Pine St</p>
              <p>Seattle, WA 98122</p>
              <Link
                className="text-pink hover:text-pink-600 focus-visible:text-pink-600"
                href="https://maps.google.com/?q=714+E+Pine+St+Seattle+WA+98122"
              >
                Open in Maps →
              </Link>
            </div>
            <div>
              <p className="font-semibold text-brown">Parking & transit</p>
              <p>Metered spots on E Pine + 10th Ave. Bike racks out front. Link light rail (Capitol Hill) is a 6-minute walk.</p>
            </div>
            <div>
              <p className="font-semibold text-brown">Pickup tips</p>
              <p>
                Use the signed loading zone after 2pm for five-minute curbside pickup. Call us at (206) 555-0184 when
                you arrive and we&apos;ll hand off your macarons outside if you prefer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Neighborhood favorites</CardTitle>
          <CardDescription>Make a day of it—here are a few places we love sending guests.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm text-brown/80">
          <div>
            <p className="font-semibold text-brown">Volunteer Park Conservatory</p>
            <p>Bloom-filled greenhouse perfect for post-dessert strolls.</p>
          </div>
          <div>
            <p className="font-semibold text-brown">Cal Anderson Park</p>
            <p>Pack a macaron picnic—sunset on the lawn is our favorite.</p>
          </div>
          <div>
            <p className="font-semibold text-brown">Elliott Bay Book Company</p>
            <p>Pair your treat with a cozy read from the neighborhood bookstore.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
