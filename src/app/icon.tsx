import { ImageResponse } from "next/og";

// Placeholder mark: an "M" on ink. Replace with the real mark when it exists.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2e2e2e",
          color: "#edeeeb",
          fontSize: 22,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
