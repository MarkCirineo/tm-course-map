import { db } from "@/lib/db";
import { CourseMap } from "@/components/course-map";

export const dynamic = "force-dynamic";

export default async function CoursesMapPage() {
  const courses = await db.course.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      displayName: true,
      courseLocation: true,
      latitude: true,
      longitude: true,
      tees: {
        select: { name: true, courseRating: true, slope: true },
      },
    },
    orderBy: { displayName: "asc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Courses Map</h1>
      <p className="mb-4 text-muted-foreground">
        {courses.length} course{courses.length !== 1 ? "s" : ""} with location
      </p>
      <CourseMap courses={courses} />
    </main>
  );
}
