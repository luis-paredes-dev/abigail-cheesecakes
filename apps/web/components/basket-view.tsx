"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { MAX_ITEM_QUANTITY, formatPrice } from "@abigail/shared";

import { Button, buttonVariants } from "@/components/ui/button";
import { useBasket } from "@/lib/basket-store";

// False on the server and during the first render in the browser, true afterwards.
// Stops the page flashing "Your basket is empty" before the saved basket loads.
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function BasketView() {
  const isClient = useIsClient();
  const { basket, itemCount, subtotalPence, setQuantity, remove } = useBasket();

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

  return (
    <div>
      <ul className="divide-y rounded-xl border">
        {basket.items.map((item) => (
          <li
            key={item.productSizeId}
            className="flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div>
              <Link
                href={`/cheesecakes/${item.productSlug}`}
                className="font-medium hover:underline"
              >
                {item.productName}
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.sizeLabel} · {formatPrice(item.unitPricePence)} each
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                role="group"
                aria-label={`Quantity of ${item.productName}, ${item.sizeLabel}`}
                className="flex items-center gap-2"
              >
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(item.productSizeId, item.quantity - 1)}
                >
                  −
                </Button>
                <span className="w-6 text-center tabular-nums" aria-live="polite">
                  {item.quantity}
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Increase quantity"
                  disabled={item.quantity >= MAX_ITEM_QUANTITY}
                  onClick={() => setQuantity(item.productSizeId, item.quantity + 1)}
                >
                  +
                </Button>
              </div>

              <p className="w-20 text-right font-semibold tabular-nums">
                {formatPrice(item.unitPricePence * item.quantity)}
              </p>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`Remove ${item.productName}, ${item.sizeLabel}`}
                onClick={() => remove(item.productSizeId)}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-lg">
        <p>
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </p>
        <p className="font-semibold tabular-nums">{formatPrice(subtotalPence)}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Delivery or pickup is chosen at checkout. Final prices are confirmed when you place your
        order.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
          Go to checkout
        </Link>
        <Link href="/cheesecakes" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
