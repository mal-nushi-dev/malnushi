import Link from "next/link";
import { ArrowLink } from "@/components/links";

export type Issue = {
  href: string;
  issue: number;
  title: string;
  date: string;
};

/**
 * The newest issue of a newsletter: its number set large, then the title,
 * the date and a link to every issue.
 */
export function IssueStub({
  name,
  href,
  issue,
}: {
  name: string;
  /** The newsletter's own page. */
  href: string;
  issue: Issue;
}) {
  return (
    <div className="flex flex-col items-start gap-(--space-sm)">
      <h3 className="type-label text-ink-2">{name}</h3>
      <Link href={issue.href} className="group flex flex-col gap-2">
        <span className="flex items-start gap-2">
          <span className="type-meta text-ink-2">No.</span>
          <span className="type-stat text-accent">{issue.issue}</span>
        </span>
        <span className="type-index-title text-ink group-hover:text-link">
          {issue.title}
        </span>
        <span className="type-meta text-ink-2">{issue.date}</span>
      </Link>
      <ArrowLink href={href}>All of {name}</ArrowLink>
    </div>
  );
}

/** The issues before the newest, one line each, hairlines between. */
export function EarlierIssues({ issues }: { issues: Issue[] }) {
  return (
    <ol className="border-t border-line">
      {issues.map((i) => (
        <li key={i.href} className="border-b border-line">
          <Link
            href={i.href}
            className="group flex items-baseline gap-(--space-sm) py-(--space-sm)"
          >
            <span className="type-meta text-ink-2">
              {String(i.issue).padStart(2, "0")}
            </span>
            <span className="type-body text-ink group-hover:text-link">
              {i.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
