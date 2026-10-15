"use client";

import { useEffect } from "react";
import { ArrowButton, ArrowLink } from "@/components/links";
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
          <ArrowButton onClick={() => retry()}>Try again</ArrowButton>
          <ArrowLink back href="/">Back to the home page</ArrowLink>
        </>
      }
    >
      The page failed to load. Trying again often fixes it.
    </StatusPage>
  );
}
