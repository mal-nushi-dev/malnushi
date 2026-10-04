import type { MDXComponents } from "mdx/types";
import { Aside } from "@/components/aside";
import { Embed } from "@/components/entry/embed";
import { InlineLink } from "@/components/links";
import { PullQuote } from "@/components/pull-quote";

/*
 * What a body in content/ is made of. Markdown maps to the house type
 * styles; `Embed` pulls another entry in by its ref.
 */
const components: MDXComponents = {
  p: (props) => <p className="type-body text-ink" {...props} />,
  h2: (props) => <h2 className="pt-(--space-md) type-h2 text-ink" {...props} />,
  a: ({ href = "", children }) => <InlineLink href={href}>{children}</InlineLink>,
  Aside,
  Embed,
  PullQuote,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
