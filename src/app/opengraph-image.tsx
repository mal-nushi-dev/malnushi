import { ImageResponse } from "next/og";
import { siteDescription, siteName } from "@/lib/site";

// Placeholder card in the site's light colors. Satori cannot read the
// next/font files, so the type is its bundled sans, not Newsreader.
export const alt = siteName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 96,
          background: "#fafafa",
          color: "#2e2e2e",
          borderTop: "8px solid #626e5e",
        }}
      >
        <div style={{ fontSize: 120, letterSpacing: -3 }}>{siteName}</div>
        <div style={{ fontSize: 36, lineHeight: 1.4, color: "#626964" }}>
          {siteDescription}
        </div>
      </div>
    ),
    size,
  );
}
