import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { mono, sans, serif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <Nav />
        {/* The page transition's plate when no spine is: see globals.css. */}
        <div
          id="vt-plate"
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 size-px"
        />
        {children}
      </body>
    </html>
  );
}
