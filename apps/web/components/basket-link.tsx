"use client";

import Link from "next/link";

import { useBasket } from "@/lib/basket-store";

export function BasketLink() {
  const { itemCount } = useBasket();

  return (
    <Link href="/basket" className="text-sm hover:underline">
      {itemCount > 0 ? `Basket (${itemCount})` : "Basket"}
    </Link>
  );
}
