/** Types partagés calendrier éditorial (UI + sérialisation serveur) */

export type PostStatus = "Publié" | "Brouillon" | "Planifié";
export type PostType = "article" | "podcast" | "vidéo" | "image";

export interface Post {
  id: string;
  title: string;
  status: PostStatus;
  platforms?: string[];
  description?: string;
  date: Date;
  type: PostType;
  /** `url` vide = métadonnées seules (anciens enregistrements sans fichier stocké). */
  file?: { name: string; url?: string; kind: "pdf" | "image" };
}

/** Props passées du serveur au client (dates en ISO) */
export interface SerializedPost {
  id: string;
  title: string;
  status: PostStatus;
  platforms?: string[];
  description?: string;
  date: string;
  type: PostType;
  file?: { name: string; url?: string; kind: "pdf" | "image" };
}
