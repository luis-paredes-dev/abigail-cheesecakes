import type { Metadata } from "next";
import Link from "next/link";

import { getActiveDeliveryZones, getActiveProducts } from "@abigail/database";
import { formatPrice } from "@abigail/shared";

import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Abigail's Cheesecakes | Homemade cheesecakes in London",
  description:
    "Homemade cheesecakes baked to order in London. Choose your cheesecake and size, then confirm your order on WhatsApp. Local bike delivery or pickup.",
  alternates: { canonical: "/" },
};

// Products and delivery fees come from the database; refresh at most every 5 minutes.
export const revalidate = 300;

const STEPS = [
  {
    title: "Choose your cheesecake",
    text: "Pick a flavour and the size that suits your occasion.",
  },
  {
    title: "Place your order",
    text: "Add your details and choose delivery or pickup. It takes a minute.",
  },
  {
    title: "Confirm on WhatsApp",
    text: "Send your order to Abigail on WhatsApp to agree the date and payment.",
  },
];

export default async function HomePage() {
  const db = getDb();
  const [products, zones] = await Promise.all([getActiveProducts(db), getActiveDeliveryZones(db)]);
  const featured = products.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Homemade in London
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
            {/* TODO: replace with Abigail's own tagline. */}
            Cheesecakes baked to order, with care.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Choose your favourite, pick a size, and Abigail will bake it fresh for you. Local
            delivery by bike, or pick it up yourself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cheesecakes" className={buttonVariants({ size: "lg" })}>
              Order a cheesecake
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              How ordering works
            </Link>
          </div>
        </div>
      </section>

      {/* Featured cheesecakes */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mx-auto max-w-5xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="featured-heading" className="text-2xl font-bold">
              Our cheesecakes
            </h2>
            <Link href="/cheesecakes" className="text-sm font-medium hover:underline">
              See all cheesecakes →
            </Link>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* About — placeholder until Abigail's own words are ready */}
      <section aria-labelledby="about-heading" className="bg-muted/60">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="about-heading" className="text-2xl font-bold">
            About Abigail
          </h2>
          {/* TODO: replace with Abigail's own story. */}
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Abigail bakes every cheesecake at home in London, only once it has been ordered, so each
            one is made fresh for you. A few words about how she started and what makes her
            cheesecakes special will go here soon.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="mx-auto max-w-5xl px-4 py-16"
      >
        <h2 id="how-heading" className="text-2xl font-bold">
          How ordering works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border bg-card p-5">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Delivery and pickup */}
      <section aria-labelledby="delivery-heading" className="bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 id="delivery-heading" className="text-2xl font-bold">
            Delivery and pickup
          </h2>
          <ul className="mt-6 max-w-xl divide-y rounded-xl border bg-card">
            {zones.map((zone) => (
              <li key={zone.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{zone.name}</p>
                  {zone.description && (
                    <p className="text-sm text-muted-foreground">{zone.description}</p>
                  )}
                </div>
                <p className="font-semibold tabular-nums">{formatPrice(zone.fee_pence)}</p>
              </li>
            ))}
            <li className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">Pickup</p>
                <p className="text-sm text-muted-foreground">
                  Collect your order; Abigail sends the details on WhatsApp.
                </p>
              </div>
              <p className="font-semibold">Free</p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
