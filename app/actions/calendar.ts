"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  mapUiStatus,
  mapUiType,
  prismaPostToSerialized,
} from "@/lib/calendar/mappers";
import type { PostStatus, PostType, SerializedPost } from "@/lib/calendar/types";

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}

export type CreateCalendarPostInput = {
  title: string;
  description?: string;
  status: PostStatus;
  type: PostType;
  platforms?: string[];
  scheduledAtISO: string;
  fileName?: string;
  fileUrl?: string;
  fileKind?: "pdf" | "image";
};

export async function createCalendarPost(
  input: CreateCalendarPostInput,
): Promise<{ ok: true; post: SerializedPost } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Non authentifié" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Titre requis" };
  }

  const scheduledAt = new Date(input.scheduledAtISO);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, error: "Date invalide" };
  }

  const row = await prisma.editorialPost.create({
    data: {
      userId,
      title,
      description: input.description?.trim() || null,
      status: mapUiStatus(input.status),
      type: mapUiType(input.type),
      scheduledAt,
      platforms: input.platforms?.filter(Boolean) ?? [],
      fileUrl: input.fileUrl?.trim() || null,
      fileName: input.fileName?.trim() || null,
      fileKind: input.fileKind ?? null,
    },
  });

  revalidatePath("/calendrier-editorial");
  revalidatePath("/dashboard");
  return { ok: true, post: prismaPostToSerialized(row) };
}

export type UpdateCalendarPostInput = {
  id: string;
  title: string;
  description?: string;
  status: PostStatus;
  type: PostType;
  platforms?: string[];
  scheduledAtISO: string;
};

export async function updateCalendarPost(
  input: UpdateCalendarPostInput,
): Promise<{ ok: true; post: SerializedPost } | { ok: false; error: string }> {
  const sessionUserId = await requireUserId();
  if (!sessionUserId) {
    return { ok: false, error: "Non authentifié" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Titre requis" };
  }

  const scheduledAt = new Date(input.scheduledAtISO);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, error: "Date invalide" };
  }

  const existing = await prisma.editorialPost.findUnique({ where: { id: input.id } });
  if (!existing) {
    return { ok: false, error: "Post introuvable" };
  }

  const row = await prisma.editorialPost.update({
    where: { id: input.id },
    data: {
      title,
      description: input.description?.trim() || null,
      status: mapUiStatus(input.status),
      type: mapUiType(input.type),
      scheduledAt,
      platforms: input.platforms?.filter(Boolean) ?? [],
    },
  });

  revalidatePath("/calendrier-editorial");
  revalidatePath("/dashboard");
  return { ok: true, post: prismaPostToSerialized(row) };
}

export async function deleteCalendarPost(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sessionUserId = await requireUserId();
  if (!sessionUserId) {
    return { ok: false, error: "Non authentifié" };
  }

  const existing = await prisma.editorialPost.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Post introuvable" };
  }

  await prisma.editorialPost.delete({ where: { id } });
  revalidatePath("/calendrier-editorial");
  revalidatePath("/dashboard");
  return { ok: true };
}
