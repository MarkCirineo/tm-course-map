import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export default async function AccountBookmarksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          tees: true,
          holes: { orderBy: { holeIndex: "asc" }, select: { id: true, holeIndex: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const favoriteSet = new Set(
    (await db.favorite.findMany({ where: { userId }, select: { courseId: true } })).map(
      (f) => f.courseId
    )
  );
  const plays = await db.coursePlay.findMany({
    where: { userId },
    select: { courseId: true, holesPlayed: true },
    orderBy: { playedAt: "desc" },
  });
  const playByCourse = new Map(plays.map((p) => [p.courseId, { holesPlayed: p.holesPlayed }]));

  return (
    <>
      <h1 className="text-2xl font-semibold">My bookmarks</h1>
      <p className="mt-2 text-muted-foreground">
        {bookmarks.length} bookmarked course{bookmarks.length !== 1 ? "s" : ""}
      </p>
      {bookmarks.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          You haven&apos;t bookmarked any courses yet. Bookmark courses from the{" "}
          <a href="/courses" className="text-primary hover:underline">
            course list
          </a>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((b) => (
            <div key={b.id} className="relative">
              <CourseCard
                course={{
                  id: b.course.id,
                  displayName: b.course.displayName,
                  numbersOfHoles: b.course.numbersOfHoles,
                  courseLocation: b.course.courseLocation,
                  imageUrl: b.course.imageUrl,
                  tees: b.course.tees.map((t) => ({
                    id: t.id,
                    name: t.name,
                    gender: t.gender,
                    courseRating: t.courseRating,
                    slope: t.slope,
                  })),
                  holes: b.course.holes,
                }}
                isBookmarked={true}
                bookmarkNote={b.note}
                isFavorite={favoriteSet.has(b.courseId)}
                playedSummary={{
                  played: playByCourse.has(b.courseId),
                  lastHolesPlayed: playByCourse.get(b.courseId)?.holesPlayed as
                    | "front"
                    | "back"
                    | "full"
                    | undefined,
                }}
                isLoggedIn={true}
              />
              {b.note && (
                <div className="mt-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium text-muted-foreground">Note: </span>
                  {b.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
