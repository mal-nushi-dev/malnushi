import { Google_Sans_Flex, JetBrains_Mono, Newsreader } from "next/font/google";

// Voice: headlines, reading text, standfirsts, quotes, index titles, numbers.
// opsz follows the font size (font-optical-sizing: auto).
export const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

// Structure: navigation, labels, UI text. Regular (400) everywhere.
export const sans = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
});

// Details: metadata, indexes, captions, code.
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
