import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site";

// The preview image shown when a link to the site is shared (WhatsApp, Instagram, etc.).
export const alt = `${SITE_NAME}: homemade cheesecakes baked to order in London`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "#f5f0e6",
        borderLeft: "48px solid #c6b5d8",
      }}
    >
      <div style={{ fontSize: 30, color: "#5b4772", letterSpacing: 4 }}>HOMEMADE IN LONDON</div>
      <div style={{ fontSize: 96, fontWeight: 700, color: "#2e2433", marginTop: 16 }}>
        {SITE_NAME}
      </div>
      <div style={{ fontSize: 40, color: "#6b5d63", marginTop: 24 }}>
        Cheesecakes baked to order, with care.
      </div>
    </div>,
    size,
  );
}
