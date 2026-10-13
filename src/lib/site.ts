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

/**
 * The menu section a path belongs to, for the nav's active row. Photography
 * and music live under Projects. The home page, and anything unknown, has none.
 */
export function sectionOf(pathname: string | null): Section | undefined {
  const first = pathname?.split("/")[1];
  switch (first) {
    case "writing":
    case "components":
      return "Writing";
    case "projects":
    case "photography":
    case "music":
      return "Projects";
    case "collections":
      return "Collections";
    case "about":
      return "About";
    default:
      return undefined;
  }
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
