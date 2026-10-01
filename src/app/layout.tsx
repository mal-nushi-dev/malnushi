import type { Metadata } from "next";
import { mono, sans, serif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mal Nushi",
  description:
    "Writing, projects, photography and living collections by Mal Nushi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
