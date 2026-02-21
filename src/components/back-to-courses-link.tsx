"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function BackToCoursesLink() {
  const [returnSearch, setReturnSearch] = useState("");

  useEffect(() => {
    // Only set if we actually have some search params to append
    // Though technically window.location.search would include "?" if any exist
    // and would be "" if none exist, so `/courses${returnSearch}` will just work
    const saved = sessionStorage.getItem("courseSearchUrl");
    if (saved) {
      setReturnSearch(saved);
    }
  }, []);

  return (
    <Link
      href={`/courses${returnSearch}`}
      className="mb-6 inline-block text-primary hover:underline"
    >
      ← Back to courses
    </Link>
  );
}
