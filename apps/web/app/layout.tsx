import type { Metadata } from "next";
import "./globals.css";

import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // Lets pages use relative URLs (e.g. "/cheesecakes") in link previews and canonical tags.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: "Homemade cheesecakes, baked to order in London.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
