"use client";

import dynamic from "next/dynamic";

const CourseMapInner = dynamic(
  () => import("./course-map-inner").then((m) => ({ default: m.CourseMapInner })),
  { ssr: false }
);

type CourseForMap = {
  id: string;
  displayName: string;
  courseLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  tees: Array<{ name: string | null; courseRating: number | null; slope: number | null }>;
};

export function CourseMap({ courses }: { courses: CourseForMap[] }) {
  return <CourseMapInner courses={courses} />;
}
