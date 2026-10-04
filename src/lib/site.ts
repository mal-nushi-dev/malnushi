export const siteName = "Mal Nushi";

export const siteDescription =
  "Writing, projects, photography and living collections by Mal Nushi.";

/**
 * Canonical origin, used for absolute URLs in metadata, the sitemap and
 * robots.txt. Set NEXT_PUBLIC_SITE_URL in the deploy environment.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const sections = [
  { label: "Home", href: "/" },
  { label: "Writing", href: "/writing" },
  { label: "Projects", href: "/projects" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
] as const;

export type Section = (typeof sections)[number]["label"];

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
