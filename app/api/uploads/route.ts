import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "calendar");

function getFileExtension(file: File): string {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".pdf")) return ".pdf";
  if (lowerName.endsWith(".png")) return ".png";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return ".jpg";
  if (lowerName.endsWith(".webp")) return ".webp";
  if (lowerName.endsWith(".gif")) return ".gif";
  return "";
}

function resolveKind(file: File): "pdf" | "image" | null {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return null;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Fichier manquant" },
      { status: 400 },
    );
  }

  const file = fileEntry;
  const fileKind = resolveKind(file);
  if (!fileKind) {
    return NextResponse.json(
      { ok: false, error: "Format non supporté (PDF ou image)." },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `Fichier trop volumineux (max ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} Mo).`,
      },
      { status: 413 },
    );
  }

  const extension = getFileExtension(file) || (fileKind === "pdf" ? ".pdf" : ".bin");
  const savedFileName = `${Date.now()}-${randomUUID()}${extension}`;
  const savedFilePath = path.join(UPLOAD_DIR, savedFileName);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(savedFilePath, buffer);

  return NextResponse.json({
    ok: true,
    fileUrl: `/uploads/calendar/${savedFileName}`,
    fileName: file.name,
    fileKind,
  });
}
