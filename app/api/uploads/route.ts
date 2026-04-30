import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads", "calendar");

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

function resolveMimeType(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
  if (lowerName.endsWith(".webp")) return "image/webp";
  if (lowerName.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

function isSafeFileName(fileName: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(fileName);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const fileName = requestUrl.searchParams.get("file");

  if (!fileName || !isSafeFileName(fileName)) {
    return NextResponse.json({ ok: false, error: "Fichier invalide" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    await access(filePath);
  } catch {
    return NextResponse.json({ ok: false, error: "Fichier introuvable" }, { status: 404 });
  }

  const content = await readFile(filePath);
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": resolveMimeType(fileName),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
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
    fileUrl: `/api/uploads?file=${encodeURIComponent(savedFileName)}`,
    fileName: file.name,
    fileKind,
  });
}
