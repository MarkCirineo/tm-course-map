import { NextRequest, NextResponse } from "next/server";
import { getCoursesList, type TrackmanCourseItem } from "@/lib/trackman-api";
import { db } from "@/lib/db";

function getCronSecret(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return request.nextUrl.searchParams.get("secret") ?? null;
}

export async function POST(request: NextRequest) {
  const secret = getCronSecret(request);
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await getCoursesList(0, 8000);
    const now = new Date();

    for (const item of items) {
      const course = await db.course.upsert({
        where: { trackmanId: item.id },
        create: mapCourseCreate(item, now),
        update: mapCourseUpdate(item, now),
      });

      await db.hole.deleteMany({ where: { courseId: course.id } });
      await db.tee.deleteMany({ where: { courseId: course.id } });

      const tees = item.tees ?? [];
      const teeIds: string[] = [];
      for (const t of tees) {
        const tee = await db.tee.create({
          data: {
            courseId: course.id,
            par: t.par ?? undefined,
            courseDistance: t.courseDistance ?? undefined,
            courseRating: t.courseRating ?? undefined,
            slope: t.slope ?? undefined,
            gender: t.gender ?? undefined,
            kind: t.kind ?? undefined,
            name: t.name ?? undefined,
          },
        });
        teeIds.push(tee.id);
      }

      const holes = item.holes ?? [];
      for (let i = 0; i < holes.length; i++) {
        const holeItem = holes[i];
        const hole = await db.hole.create({
          data: {
            courseId: course.id,
            name: holeItem.name ?? undefined,
            holeIndex: i,
          },
        });
        const holeTees = holeItem.tees ?? [];
        for (let j = 0; j < holeTees.length && j < teeIds.length; j++) {
          const ht = holeTees[j];
          await db.holeTee.create({
            data: {
              holeId: hole.id,
              teeId: teeIds[j],
              distance: ht.distance ?? undefined,
              strokeIndex: ht.strokeIndex ?? undefined,
              par: ht.par ?? undefined,
            },
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      synced: items.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mapCourseCreate(item: TrackmanCourseItem, syncedAt: Date) {
  const loc = item.worldLocation;
  return {
    trackmanId: item.id,
    dbId: item.dbId ?? undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    description: item.description ?? undefined,
    displayName: item.displayName,
    numbersOfHoles: item.numbersOfHoles ?? undefined,
    courseLocation: item.courseLocation ?? undefined,
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? [],
    imageUrl: item.image?.url ?? undefined,
    videoUrl: item.video?.url ?? undefined,
    latitude: loc?.latitude ?? undefined,
    longitude: loc?.longitude ?? undefined,
    googleMapUrl: loc?.googleMapUrl ?? undefined,
    syncedAt,
  };
}

function mapCourseUpdate(item: TrackmanCourseItem, syncedAt: Date) {
  const loc = item.worldLocation;
  return {
    dbId: item.dbId ?? undefined,
    description: item.description ?? undefined,
    displayName: item.displayName,
    numbersOfHoles: item.numbersOfHoles ?? undefined,
    courseLocation: item.courseLocation ?? undefined,
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? [],
    imageUrl: item.image?.url ?? undefined,
    videoUrl: item.video?.url ?? undefined,
    latitude: loc?.latitude ?? undefined,
    longitude: loc?.longitude ?? undefined,
    googleMapUrl: loc?.googleMapUrl ?? undefined,
    syncedAt,
  };
}
