import type { Post, PostStatus, PostType, SerializedPost } from "./types";

/** Aligné sur le modèle Prisma `EditorialPost` (évite une dépendance stricte au client généré). */
export type DbEditorialPostStatus = "PUBLIE" | "BROUILLON" | "PLANIFIE";
export type DbEditorialPostType = "ARTICLE" | "PODCAST" | "VIDEO" | "IMAGE";

export type DbEditorialPost = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: DbEditorialPostStatus;
  type: DbEditorialPostType;
  scheduledAt: Date;
  platforms: string[];
  fileUrl: string | null;
  fileName: string | null;
  fileKind: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_TO_UI: Record<DbEditorialPostStatus, PostStatus> = {
  PUBLIE: "Publié",
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
};

const UI_TO_STATUS: Record<PostStatus, DbEditorialPostStatus> = {
  Publié: "PUBLIE",
  Brouillon: "BROUILLON",
  Planifié: "PLANIFIE",
};

const TYPE_TO_UI: Record<DbEditorialPostType, PostType> = {
  ARTICLE: "article",
  PODCAST: "podcast",
  VIDEO: "vidéo",
  IMAGE: "image",
};

const UI_TO_TYPE: Record<PostType, DbEditorialPostType> = {
  article: "ARTICLE",
  podcast: "PODCAST",
  "vidéo": "VIDEO",
  image: "IMAGE",
};

export function prismaPostToSerialized(row: DbEditorialPost): SerializedPost {
  const base: SerializedPost = {
    id: row.id,
    title: row.title,
    status: STATUS_TO_UI[row.status],
    description: row.description ?? undefined,
    date: row.scheduledAt.toISOString(),
    type: TYPE_TO_UI[row.type],
    platforms: row.platforms.length ? row.platforms : undefined,
  };
  if (row.fileName && row.fileKind) {
    base.file = {
      name: row.fileName,
      url: row.fileUrl ?? undefined,
      kind: row.fileKind as "pdf" | "image",
    };
  }
  return base;
}

export function serializedToPost(s: SerializedPost): Post {
  return {
    ...s,
    date: new Date(s.date),
  };
}

export function mapUiStatus(s: PostStatus): DbEditorialPostStatus {
  return UI_TO_STATUS[s];
}

export function mapUiType(t: PostType): DbEditorialPostType {
  return UI_TO_TYPE[t];
}
