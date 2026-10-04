"use client";

import { useEffect } from "react";
import { ArrowLink } from "@/components/links";
import { StatusPage } from "@/components/status-page";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      label="Error"
      title="Something went wrong."
      actions={
        <>
          <button
            type="button"
            onClick={() => retry()}
            className="type-ui cursor-pointer text-link hover:text-ink hover:underline"
          >
            Try again <span aria-hidden>→</span>
          </button>
          <ArrowLink href="/">Back to the home page</ArrowLink>
        </>
      }
    >
      The page failed to load. Trying again often fixes it.
    </StatusPage>
  );
}
