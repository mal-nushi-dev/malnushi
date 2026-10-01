export const sections = [
  { label: "Writing", href: "/writing" },
  { label: "Work", href: "/work" },
  { label: "Photography", href: "/photography" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
] as const;

export type Section = (typeof sections)[number]["label"];

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
