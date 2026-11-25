"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { DeliveryZone } from "@abigail/database";
import { formatPrice } from "@abigail/shared";

import { placeOrder, type CheckoutState } from "@/app/(storefront)/checkout/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { clearBasket, useBasket } from "@/lib/basket-store";
import { useIsClient } from "@/lib/use-is-client";

const INITIAL_STATE: CheckoutState = { status: "idle" };

const inputClass =
  "mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

// Runs the server action, then empties the basket once the order is saved.
async function submitOrder(previous: CheckoutState, formData: FormData) {
  const result = await placeOrder(previous, formData);
  if (result.status === "success") {
    clearBasket();
  }
  return result;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-1 text-sm text-destructive">
      {message}
    </p>
  );
}

export function CheckoutForm({ zones }: { zones: DeliveryZone[] }) {
  const isClient = useIsClient();
  const { basket, subtotalPence } = useBasket();
  const [state, formAction, isPending] = useActionState(submitOrder, INITIAL_STATE);

  const previous = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.fieldErrors : {};

  const [method, setMethod] = useState<"delivery" | "pickup">(
    previous?.fulfilmentMethod === "pickup" ? "pickup" : "delivery",
  );
  const [zoneId, setZoneId] = useState(previous?.deliveryZoneId ?? zones[0]?.id ?? "");

  if (state.status === "success") {
    return (
      <div className="max-w-xl rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Order placed — thank you!</h2>
        <p className="mt-2">
          Your order reference is <strong className="font-mono">{state.reference}</strong>.
        </p>
        <p className="mt-2 text-muted-foreground">
          One last step: send your order to Abigail on WhatsApp so she can confirm it and arrange
          payment.
        </p>
        <a
          href={state.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          Send order on WhatsApp
        </a>
      </div>
    );
  }

  if (!isClient) {
    return <p className="text-muted-foreground">Loading your basket…</p>;
  }

  if (basket.items.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">Your basket is empty.</p>
        <Link href="/cheesecakes" className={buttonVariants({ className: "mt-6" })}>
          Browse cheesecakes
        </Link>
      </div>
    );
  }

  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee = method === "delivery" ? (zone?.fee_pence ?? 0) : 0;
  const items = JSON.stringify(
    basket.items.map((item) => ({ productSizeId: item.productSizeId, quantity: item.quantity })),
  );

  return (
    <form action={formAction} className="grid gap-10 md:grid-cols-[1fr_20rem]">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Your details</legend>

          <div>
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              defaultValue={previous?.fullName}
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={inputClass}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={previous?.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={inputClass}
            />
            <FieldError id="phone-error" message={errors.phone} />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={previous?.email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClass}
            />
            <FieldError id="email-error" message={errors.email} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Delivery or pickup</legend>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fulfilmentMethod"
                value="delivery"
                checked={method === "delivery"}
                onChange={() => setMethod("delivery")}
                disabled={zones.length === 0}
              />
              Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fulfilmentMethod"
                value="pickup"
                checked={method === "pickup"}
                onChange={() => setMethod("pickup")}
              />
              Pickup
            </label>
          </div>

          {method === "delivery" ? (
            <>
              <div>
                <label htmlFor="deliveryZoneId" className="text-sm font-medium">
                  Delivery area
                </label>
                <select
                  id="deliveryZoneId"
                  name="deliveryZoneId"
                  value={zoneId}
                  onChange={(event) => setZoneId(event.target.value)}
                  aria-invalid={errors.deliveryZoneId ? true : undefined}
                  aria-describedby={errors.deliveryZoneId ? "deliveryZoneId-error" : undefined}
                  className={inputClass}
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatPrice(z.fee_pence)}
                    </option>
                  ))}
                </select>
                {zone?.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{zone.description}</p>
                )}
                <FieldError id="deliveryZoneId-error" message={errors.deliveryZoneId} />
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="text-sm font-medium">
                  Delivery address
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  autoComplete="street-address"
                  rows={3}
                  required
                  defaultValue={previous?.deliveryAddress}
                  aria-invalid={errors.deliveryAddress ? true : undefined}
                  aria-describedby={errors.deliveryAddress ? "deliveryAddress-error" : undefined}
                  className={inputClass}
                />
                <FieldError id="deliveryAddress-error" message={errors.deliveryAddress} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Abigail will send you the pickup details on WhatsApp.
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Preferred date and time, allergies, a message for the cake…"
            defaultValue={previous?.notes}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby={errors.notes ? "notes-error" : undefined}
            className={inputClass}
          />
          <FieldError id="notes-error" message={errors.notes} />
        </div>
      </div>

      <aside className="h-fit rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Your order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {basket.items.map((item) => (
            <li key={item.productSizeId} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.productName} ({item.sizeLabel})
              </span>
              <span className="tabular-nums">
                {formatPrice(item.unitPricePence * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotalPence)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{method === "delivery" ? "Delivery" : "Pickup"}</dt>
            <dd className="tabular-nums">
              {method === "delivery" ? formatPrice(deliveryFee) : "Free"}
            </dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(subtotalPence + deliveryFee)}</dd>
          </div>
        </dl>

        <input type="hidden" name="items" value={items} />

        {state.status === "error" && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {errors.items ?? state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-4 w-full" disabled={isPending}>
          {isPending ? "Placing order…" : "Place order"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          You&apos;ll confirm and pay with Abigail on WhatsApp.
        </p>
      </aside>
    </form>
  );
}
