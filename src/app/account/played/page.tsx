import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AccountPlayedPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const plays = await db.coursePlay.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          tees: true,
          holes: { orderBy: { holeIndex: "asc" }, select: { id: true, holeIndex: true } },
        },
      },
      tee: true,
    },
    orderBy: { playedAt: "desc" },
  });

  const courseIds = [...new Set(plays.map((p) => p.courseId))];
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    select: { courseId: true, note: true },
  });
  const bookmarkNoteByCourse = new Map(bookmarks.map((b) => [b.courseId, b.note]));
  const favoriteSet = new Set(
    (await db.favorite.findMany({ where: { userId }, select: { courseId: true } })).map(
      (f) => f.courseId
    )
  );
  const lastPlayByCourse = new Map<string, (typeof plays)[0]>();
  for (const p of plays) {
    if (!lastPlayByCourse.has(p.courseId)) lastPlayByCourse.set(p.courseId, p);
  }

  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    include: {
      tees: true,
      holes: { orderBy: { holeIndex: "asc" }, select: { id: true, holeIndex: true } },
    },
  });
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const playsByCourse = new Map<string, typeof plays>();
  for (const p of plays) {
    const list = playsByCourse.get(p.courseId) ?? [];
    list.push(p);
    playsByCourse.set(p.courseId, list);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">My played courses</h1>
      <p className="mt-2 text-muted-foreground">
        {courseIds.length} course{courseIds.length !== 1 ? "s" : ""} played
      </p>
      {courseIds.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Mark courses as played from the course list or course detail page to see them here.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {courseIds.map((courseId) => {
            const course = courseById.get(courseId);
            if (!course) return null;
            const coursePlays = playsByCourse.get(courseId) ?? [];
            const lastPlay = lastPlayByCourse.get(courseId);
            return (
              <div key={courseId}>
                <div className="mb-2">
                  <CourseCard
                    course={{
                      id: course.id,
                      displayName: course.displayName,
                      numbersOfHoles: course.numbersOfHoles,
                      courseLocation: course.courseLocation,
                      imageUrl: course.imageUrl,
                      tees: course.tees.map((t) => ({
                        id: t.id,
                        name: t.name,
                        gender: t.gender,
                        courseRating: t.courseRating,
                        slope: t.slope,
                      })),
                      holes: course.holes,
                    }}
                    isBookmarked={bookmarkNoteByCourse.has(courseId)}
                    bookmarkNote={bookmarkNoteByCourse.get(courseId) ?? null}
                    isFavorite={favoriteSet.has(courseId)}
                    playedSummary={{
                      played: true,
                      lastHolesPlayed: lastPlay?.holesPlayed as "front" | "back" | "full" | undefined,
                    }}
                    isLoggedIn={true}
                  />
                </div>
                <Card className="mt-2">
                  <CardHeader className="pb-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Play history ({coursePlays.length})
                    </h2>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {coursePlays.map((play) => (
                        <li
                          key={play.id}
                          className="flex flex-wrap items-center gap-2 text-sm"
                        >
                          <span className="text-muted-foreground">
                            {new Date(play.playedAt).toLocaleDateString()}
                          </span>
                          <span>
                            {play.tee.name || play.tee.gender || "Tee"} —{" "}
                            {play.holesPlayed === "front"
                              ? "Front 9"
                              : play.holesPlayed === "back"
                                ? "Back 9"
                                : "Full 18"}
                          </span>
                          {play.overallScore != null && (
                            <span className="font-medium">{play.overallScore}</span>
                          )}
                          {play.note && (
                            <span className="text-muted-foreground">· {play.note}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
