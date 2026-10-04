import { ImageResponse } from "next/og";

// Placeholder mark, same as icon.tsx at the size iOS asks for.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 124,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
