import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  userDisplayName: string;
  todayLabel: string;
  scheduledCount: number;
  publishedCount: number;
  upcomingCount: number;
  /** Utilisateurs enregistrés sur l’app (toute l’instance). */
  membersCount: number;
  /** Un point par jour sur les 7 derniers jours (incluant aujourd’hui), posts planifiés ou publiés ce jour-là (`scheduledAt`). */
  weekVelocity: number[];
  weekDayLabels: string[];
  weekMax: number;
  /** Pour la carte « trending » : dernier post modifié. */
  latestPostTitle: string | null;
  draftsCount: number;
};

const DAY_SHORT_FR = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const name = session.user.name?.trim();
  const email = session.user.email ?? "";
  const userDisplayName =
    name || (email ? email.split("@")[0] : "Utilisateur");

  const now = new Date();
  const todayLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startOfToday = startOfLocalDay(now);

  const [
    scheduledCount,
    publishedCount,
    upcomingCount,
    membersCount,
    draftsCount,
    latestPost,
  ] = await Promise.all([
    prisma.editorialPost.count({
      where: { userId, status: "PLANIFIE" },
    }),
    prisma.editorialPost.count({
      where: { userId, status: "PUBLIE" },
    }),
    prisma.editorialPost.count({
      where: {
        userId,
        status: "PLANIFIE",
        scheduledAt: { gte: startOfToday },
      },
    }),
    prisma.user.count(),
    prisma.editorialPost.count({
      where: { userId, status: "BROUILLON" },
    }),
    prisma.editorialPost.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { title: true },
    }),
  ]);

  const oldestDay = startOfLocalDay(addDays(now, -6));
  const endExclusive = addDays(startOfLocalDay(now), 1);

  type PostScheduledSlice = { scheduledAt: Date };

  const postsInWindow: PostScheduledSlice[] = await prisma.editorialPost.findMany({
    where: {
      userId,
      scheduledAt: {
        gte: oldestDay,
        lt: endExclusive,
      },
    },
    select: { scheduledAt: true },
  });

  const weekVelocity: number[] = [];
  const weekDayLabels: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayStart = startOfLocalDay(addDays(now, -i));
    const dayEnd = addDays(dayStart, 1);
    const count = postsInWindow.filter(
      (p) => p.scheduledAt >= dayStart && p.scheduledAt < dayEnd,
    ).length;
    weekVelocity.push(count);
    weekDayLabels.push(DAY_SHORT_FR[dayStart.getDay()]);
  }

  const weekMax = Math.max(1, ...weekVelocity);

  return {
    userDisplayName,
    todayLabel,
    scheduledCount,
    publishedCount,
    upcomingCount,
    membersCount,
    weekVelocity,
    weekDayLabels,
    weekMax,
    latestPostTitle: latestPost?.title ?? null,
    draftsCount,
  };
}
