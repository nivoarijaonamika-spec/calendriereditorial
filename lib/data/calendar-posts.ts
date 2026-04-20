import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prismaPostToSerialized } from "@/lib/calendar/mappers";
import type { SerializedPost } from "@/lib/calendar/types";

/** Liste des posts éditoriaux de l’utilisateur connecté (tri par date). */
export async function getCalendarPosts(): Promise<SerializedPost[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return [];
  }

  const rows = await prisma.editorialPost.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "asc" },
  });

  return rows.map(prismaPostToSerialized);
}
