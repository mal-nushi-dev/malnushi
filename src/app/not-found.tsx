import type { Metadata } from "next";
import { StatusPage } from "@/components/status-page";
import { ArrowLink } from "@/components/links";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage
      label="404"
      title="That page isn’t here."
      actions={<ArrowLink href="/">Back to the home page</ArrowLink>}
    >
      It may not be written yet, or the link may be wrong. Most of this site is
      still being worked on.
    </StatusPage>
  );
}
