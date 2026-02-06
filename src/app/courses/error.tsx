"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-center text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
