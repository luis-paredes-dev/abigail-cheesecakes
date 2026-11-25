import Link from "next/link";

import { BasketLink } from "@/components/basket-link";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      {/* Sticky: stays at the top of the screen while scrolling. */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold">
            Abigail&apos;s Cheesecakes
          </Link>
          <nav aria-label="Main" className="flex items-center gap-6">
            <Link href="/cheesecakes" className="text-sm hover:underline">
              Cheesecakes
            </Link>
            <BasketLink />
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          {`© ${new Date().getFullYear()} Abigail's Cheesecakes. Homemade in London.`}
        </div>
      </footer>
    </>
  );
}
