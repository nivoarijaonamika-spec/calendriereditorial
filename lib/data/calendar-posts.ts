import { prisma } from "@/lib/prisma";
import { prismaPostToSerialized } from "@/lib/calendar/mappers";
import type { SerializedPost } from "@/lib/calendar/types";

/** Liste de tous les posts éditoriaux (tri par date). */
export async function getCalendarPosts(): Promise<SerializedPost[]> {
  const rows = await prisma.editorialPost.findMany({
    orderBy: { scheduledAt: "asc" },
  });

  return rows.map(prismaPostToSerialized);
}
