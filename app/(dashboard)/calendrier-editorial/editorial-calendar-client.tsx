"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useOverlayState, Drawer } from "@heroui/react";
import toast from "react-hot-toast";
import {
  createCalendarPost,
  deleteCalendarPost,
  updateCalendarPost,
} from "@/app/actions/calendar";
import type { Post, PostStatus, PostType, SerializedPost } from "@/lib/calendar/types";
import { serializedToPost } from "@/lib/calendar/mappers";

type ViewMode = "Mois" | "Semaine" | "Année";

// ─── Locale helpers ───────────────────────────────────────────────────────────
const MOIS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const JOURS_C = ["LUN","MAR","MER","JEU","VEN","SAM","DIM"];
const JOURS_L = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function dowMon(d: Date) { return (d.getDay() + 6) % 7; }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Fichier brut max côté UI.
 * Le payload Server Action contient une Data URL base64 (+~33%), et certains reverse proxies
 * appliquent une limite plus basse que Next.js -> 413 Request Entity Too Large.
 */
const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const ESTIMATED_SERVER_ACTION_LIMIT_BYTES = 8 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (typeof fr.result === "string") resolve(fr.result);
      else reject(new Error("Lecture fichier"));
    };
    fr.onerror = () => reject(new Error("Lecture fichier"));
    fr.readAsDataURL(file);
  });
}

function estimateDataUrlBytes(file: File): number {
  // Approximation robuste: base64 ~= 4/3 + en-tête data URL.
  return Math.ceil((file.size * 4) / 3) + 1024;
}
function buildMonthGrid(y: number, m: number) {
  const first = new Date(y, m, 1);
  const offset = dowMon(first);
  const total = daysInMonth(y, m);
  const cells: { date: Date; current: boolean }[] = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ date: new Date(y, m, -i), current: false });
  for (let d = 1; d <= total; d++) cells.push({ date: new Date(y, m, d), current: true });
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), current: false });
  }
  return cells;
}

function buildWeekGrid(y: number, m: number, weekOffset: number) {
  const first = new Date(y, m, 1);
  const offset = dowMon(first);
  const monday = new Date(y, m, 1 - offset + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d, current: d.getMonth() === m };
  });
}

function isSameMonth(d: Date, y: number, m: number): boolean {
  return d.getFullYear() === y && d.getMonth() === m;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<PostStatus, string> = {
  "Publié": "#00e5a0", "Brouillon": "#8888aa", "Planifié": "#f472b6",
};
const TYPE_ICON: Record<PostType, string> = {
  article: "📝", podcast: "🎙", "vidéo": "🎬", image: "🖼",
};

const today = new Date();
const CY = today.getFullYear();
const CM = today.getMonth();

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#1a1a2a", border: "1px solid #2a2a40",
  borderRadius: 10, padding: "10px 14px", color: "#f0f0ff",
  fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#6060a0",
  display: "block", marginBottom: 7, letterSpacing: "0.08em",
};

// ─── PostPill ─────────────────────────────────────────────────────────────────
function PostPill({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: 12,
        padding: 8, fontSize: 11, color: "#d0d0e8",
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#f04090")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a3e")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
        {post.status === "Brouillon" ? (
          <span style={{
            background: "#2e2e40", border: "1px solid #404060", borderRadius: 5,
            padding: "1px 6px", fontSize: 9, fontWeight: 700, color: "#8888aa", letterSpacing: "0.08em",
          }}>BROUILLON</span>
        ) : (
          <span style={{ color: STATUS_COLOR[post.status], fontSize: 10, fontWeight: 700 }}>
            ● {post.status}
          </span>
        )}
      </div>

      {post.file?.kind === "image" && post.file.url ? (
        <div
          style={{
            width: "100%",
            height: 58,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #2a2a3e",
            background: "#0b0b12",
            marginBottom: 6,
          }}
        >
          <img
            src={post.file.url}
            alt={post.file.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ) : post.file?.kind === "pdf" ? (
        <div
          style={{
            width: "100%",
            height: 58,
            borderRadius: 8,
            border: "1px solid #3d2940",
            background: "linear-gradient(135deg, #2a1a2a 0%, #1a1a2a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 17 }}>📄</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#f0a0c8" }}>
            PDF
          </span>
        </div>
      ) : null}

      <div
        style={{
          fontWeight: 700,
          fontSize: 12,
          color: "#f0f0ff",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.title}
      </div>
      {post.platforms && (
        <div style={{ color: "#7070a0", fontSize: 10, marginTop: 2 }}>{post.platforms.join(" · ")}</div>
      )}
    </button>
  );
}

// ─── AddDrawer ────────────────────────────────────────────────────────────────
function AddDrawer({
  state, initialDate, onPostCreated,
}: {
  state: ReturnType<typeof useOverlayState>;
  initialDate: Date | null;
  onPostCreated: (p: Post) => void;
}) {
  const [title, setTitle]   = useState("");
  const [desc, setDesc]     = useState("");
  const [status, setStatus] = useState<PostStatus>("Brouillon");
  const [type, setType]     = useState<PostType>("article");
  const [plat, setPlat]     = useState("");
  const [file, setFile]     = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || file.type === "application/pdf") {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const reset = () => {
    setTitle(""); setDesc(""); setStatus("Brouillon");
    setType("article"); setPlat(""); setFile(null); setFilePreviewUrl(null);
  };

  const handleAdd = async () => {
    if (!title.trim() || !initialDate || saving) return;
    setSaving(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileKind: "pdf" | "image" | undefined;
      if (file) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(
            `Fichier trop volumineux (max ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))} Mo).`,
          );
          setSaving(false);
          return;
        }
        const estimatedPayloadBytes = estimateDataUrlBytes(file);
        if (estimatedPayloadBytes > ESTIMATED_SERVER_ACTION_LIMIT_BYTES) {
          toast.error(
            "Ce fichier est trop lourd pour l’envoi (erreur 413). Réduisez sa taille puis réessayez.",
          );
          setSaving(false);
          return;
        }
        fileName = file.name;
        fileKind = file.type === "application/pdf" ? "pdf" : "image";
        try {
          fileUrl = await readFileAsDataUrl(file);
        } catch {
          toast.error("Impossible de lire le fichier.");
          setSaving(false);
          return;
        }
      }

      const res = await createCalendarPost({
        title: title.trim(),
        description: desc.trim() || undefined,
        status,
        type,
        platforms: plat ? plat.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        scheduledAtISO: initialDate.toISOString(),
        fileName,
        fileKind,
        fileUrl,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const created = serializedToPost(res.post);
      onPostCreated(created);
      reset();
      state.close();
      toast.success("Post enregistré");
    } catch {
      toast.error(
        "Envoi échoué (taille de requête trop grande). Compressez le fichier puis réessayez.",
      );
    } finally {
      setSaving(false);
    }
  };

  // HeroUI v3 Drawer — compound pattern, no isOpen/onOpenChange on root
  // Controlled via state prop on root + useOverlayState
  return (
    <Drawer state={state}>
      {/* No trigger child — we open programmatically via state.open() */}
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="h-[100dvh] max-h-[100dvh] w-full max-w-[min(100vw,28rem)] bg-[#10101a]">
            <Drawer.CloseTrigger
              className="absolute top-4 right-4 text-[#6060a0] hover:text-[#f0f0ff] transition-colors"
              onClick={reset}
            />
            <Drawer.Header className="border-b border-[#1e1e30] pb-4">
              <Drawer.Heading className="text-[#f0f0ff] font-black text-lg">
                Nouveau Post
              </Drawer.Heading>
              {initialDate && (
                <p className="text-[#6060a0] text-xs mt-1">
                  {initialDate.toLocaleDateString("fr-FR", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
            </Drawer.Header>

            <Drawer.Body className="bg-[#10101a]">
              <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "8px 0" }}>
                {/* Fichier */}
                <div>
                  <label style={labelStyle}>FICHIER (PDF ou IMAGE)</label>
                  <div
                    onClick={() => fRef.current?.click()}
                    style={{
                      border: "2px dashed #2a2a40", borderRadius: 12, padding: "22px 16px",
                      textAlign: "center", cursor: "pointer", color: "#5050a0",
                      fontSize: 13, transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#f04090")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a40")}
                  >
                    {file ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        {file.type === "application/pdf" ? (
                          <div
                            style={{
                              width: "100%",
                              maxWidth: 220,
                              borderRadius: 10,
                              border: "1px solid #3d2940",
                              background: "linear-gradient(135deg, #2a1a2a 0%, #1a1a2a 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              padding: "12px 10px",
                              color: "#f0a0c8",
                              fontWeight: 800,
                              fontSize: 11,
                              letterSpacing: "0.08em",
                            }}
                          >
                            <span style={{ fontSize: 18 }}>📄</span>
                            <span>PDF</span>
                          </div>
                        ) : filePreviewUrl ? (
                          <img
                            src={filePreviewUrl}
                            alt={file.name}
                            style={{
                              width: "100%",
                              maxWidth: 220,
                              maxHeight: 120,
                              borderRadius: 10,
                              objectFit: "cover",
                              border: "1px solid #2a2a40",
                              display: "block",
                            }}
                          />
                        ) : null}
                        <span
                          style={{
                            color: "#00e5a0",
                            fontWeight: 700,
                            fontSize: 12,
                            maxWidth: 260,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ {file.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                        <div>Cliquez ou glissez un fichier</div>
                        <div style={{ fontSize: 11, marginTop: 4, color: "#3a3a60" }}>PDF, PNG, JPG</div>
                      </>
                    )}
                  </div>
                  <input ref={fRef} type="file" accept=".pdf,image/*"
                    style={{ display: "none" }}
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </div>

                {/* Titre */}
                <div>
                  <label style={labelStyle}>TITRE *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Titre du post..." style={inputStyle} />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Description du contenu..." rows={3}
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* Type & Statut */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label style={labelStyle}>TYPE</label>
                    <select value={type} onChange={e => setType(e.target.value as PostType)} style={inputStyle}>
                      <option value="article">📝 Article</option>
                      <option value="podcast">🎙 Podcast</option>
                      <option value="vidéo">🎬 Vidéo</option>
                      <option value="image">🖼 Image</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>STATUT</label>
                    <select value={status} onChange={e => setStatus(e.target.value as PostStatus)} style={inputStyle}>
                      <option value="Brouillon">Brouillon</option>
                      <option value="Planifié">Planifié</option>
                      <option value="Publié">Publié</option>
                    </select>
                  </div>
                </div>

                {/* Plateformes */}
                <div>
                  <label style={labelStyle}>PLATEFORMES (séparées par virgule)</label>
                  <input value={plat} onChange={e => setPlat(e.target.value)}
                    placeholder="IG, FB, TW, LK..." style={inputStyle} />
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer className="border-t border-[#1e1e30]">
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button
                  slot="close"
                  onClick={reset}
                  style={{
                    flex: 1, background: "#1a1a2a", border: "1px solid #2a2a40",
                    borderRadius: 10, padding: 10, color: "#8888aa",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => void handleAdd()}
                  disabled={!title.trim() || saving}
                  style={{
                    flex: 2, background: title.trim() && !saving ? "#f04090" : "#2a2a3a",
                    border: "none", borderRadius: 10, padding: 10,
                    color: title.trim() && !saving ? "#fff" : "#5050a0",
                    fontSize: 13, fontWeight: 700,
                    cursor: title.trim() && !saving ? "pointer" : "not-allowed",
                    boxShadow: title.trim() && !saving ? "0 0 16px #f0409055" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {saving ? "…" : "Enregistrer"}
                </button>
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function downloadAsset(url: string | undefined, filename: string) {
  if (!url?.trim()) {
    toast.error("Aucun fichier téléchargeable.");
    return;
  }
  const name = filename.trim() || "fichier";
  if (url.startsWith("blob:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  void (async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  })();
}

/** URL pour l’aperçu intégré (navigateurs PDF : fragment #page=1). */
function pdfPreviewEmbedSrc(url: string): string {
  const u = url.trim();
  if (!u || u.includes("#")) return u;
  return `${u}#page=1`;
}

// ─── DetailDrawer ─────────────────────────────────────────────────────────────
function DetailDrawer({
  state,
  post,
  onDelete,
  onPostUpdated,
}: {
  state: ReturnType<typeof useOverlayState>;
  post: Post | null;
  onDelete: (id: string) => void | Promise<void>;
  onPostUpdated: (p: Post) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<PostStatus>("Brouillon");
  const [type, setType] = useState<PostType>("article");
  const [plat, setPlat] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (!post) {
      setEditing(false);
      return;
    }
    setTitle(post.title);
    setDesc(post.description ?? "");
    setStatus(post.status);
    setType(post.type);
    setPlat(post.platforms?.join(", ") ?? "");
    setDateStr(toInputDate(post.date));
    setEditing(false);
  }, [post?.id]);

  const rowStyle: React.CSSProperties = {
    background: "#1a1a2a", borderRadius: 12, padding: "12px 16px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const keyStyle: React.CSSProperties = {
    fontSize: 11, color: "#5f8f78", fontWeight: 700, letterSpacing: "0.06em",
  };

  const handleSave = async () => {
    if (!post || !title.trim() || saving) return;
    setSaving(true);
    try {
      const d = new Date(`${dateStr}T12:00:00`);
      const res = await updateCalendarPost({
        id: post.id,
        title: title.trim(),
        description: desc.trim() || undefined,
        status,
        type,
        platforms: plat
          ? plat.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        scheduledAtISO: d.toISOString(),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      let next = serializedToPost(res.post);
      if (
        post.file &&
        (!next.file || (post.file.url?.startsWith("blob:") && !next.file.url))
      ) {
        next = { ...next, file: post.file };
      }
      onPostUpdated(next);
      setEditing(false);
      toast.success("Post mis à jour");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!post) return;
    setTitle(post.title);
    setDesc(post.description ?? "");
    setStatus(post.status);
    setType(post.type);
    setPlat(post.platforms?.join(", ") ?? "");
    setDateStr(toInputDate(post.date));
    setEditing(false);
  };

  return (
    <Drawer state={state}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="h-[100dvh] max-h-[100dvh] w-full max-w-[min(100vw,28rem)] bg-[#10101a]">
            <Drawer.CloseTrigger className="absolute top-4 right-4 text-[#6060a0] hover:text-[#f0f0ff] transition-colors" />

            <Drawer.Header className="border-b border-[#1e1e30] pb-4">
              {post && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>
                    {TYPE_ICON[editing ? type : post.type]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editing ? (
                      <>
                        <label style={{ ...labelStyle, marginBottom: 6 }}>TITRE</label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          style={{ ...inputStyle, marginBottom: 10 }}
                        />
                        <label style={{ ...labelStyle, marginBottom: 6 }}>DATE</label>
                        <input
                          type="date"
                          value={dateStr}
                          onChange={(e) => setDateStr(e.target.value)}
                          style={inputStyle}
                        />
                      </>
                    ) : (
                      <>
                        <Drawer.Heading className="text-[#f0f0ff] font-black text-lg">
                          {post.title}
                        </Drawer.Heading>
                        <p className="mt-1 text-xs text-[#6060a0]">
                          {post.date.toLocaleDateString("fr-FR", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Drawer.Header>

            <Drawer.Body className="bg-[#10101a]">
              {post && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "8px 0" }}>
                  {editing ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label style={labelStyle}>TYPE</label>
                          <select
                            value={type}
                            onChange={(e) => setType(e.target.value as PostType)}
                            style={inputStyle}
                          >
                            <option value="article">📝 Article</option>
                            <option value="podcast">🎙 Podcast</option>
                            <option value="vidéo">🎬 Vidéo</option>
                            <option value="image">🖼 Image</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>STATUT</label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as PostStatus)}
                            style={inputStyle}
                          >
                            <option value="Brouillon">Brouillon</option>
                            <option value="Planifié">Planifié</option>
                            <option value="Publié">Publié</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>DESCRIPTION</label>
                        <textarea
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          rows={4}
                          placeholder="Description…"
                          style={{ ...inputStyle, resize: "vertical" }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          PLATEFORMES (séparées par virgule)
                        </label>
                        <input
                          value={plat}
                          onChange={(e) => setPlat(e.target.value)}
                          placeholder="IG, FB, TW…"
                          style={inputStyle}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={rowStyle}>
                        <span style={keyStyle}>STATUT</span>
                        <span style={{ color: STATUS_COLOR[post.status], fontWeight: 800, fontSize: 13 }}>
                          ● {post.status}
                        </span>
                      </div>
                      <div style={rowStyle}>
                        <span style={keyStyle}>TYPE</span>
                        <span style={{ color: "#c0c0e0", fontWeight: 700, fontSize: 13 }}>
                          {TYPE_ICON[post.type]}{" "}
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </span>
                      </div>
                      {post.platforms && post.platforms.length > 0 && (
                        <div>
                          <div style={{ ...keyStyle, marginBottom: 10 }}>PLATEFORMES</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {post.platforms.map((p) => (
                              <span
                                key={p}
                                style={{
                                  background: "#1e1e30",
                                  border: "1px solid #2e2e50",
                                  borderRadius: 20,
                                  padding: "4px 12px",
                                  fontSize: 12,
                                  color: "#9090c0",
                                  fontWeight: 700,
                                }}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {!editing && post.description && (
                    <div>
                      <div style={{ ...keyStyle, marginBottom: 8 }}>DESCRIPTION</div>
                      <div
                        style={{
                          background: "#1a1a2a",
                          borderRadius: 12,
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#c0c0e0",
                          lineHeight: 1.7,
                        }}
                      >
                        {post.description}
                      </div>
                    </div>
                  )}
                  {post.file && !editing && (
                    <div>
                      <div style={{ ...keyStyle, marginBottom: 8 }}>FICHIER ATTACHÉ</div>
                      {post.file.kind === "image" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {post.file.url ? (
                            <img
                              src={post.file.url}
                              alt={post.file.name}
                              style={{
                                width: "100%",
                                maxHeight: "min(50vh, 420px)",
                                objectFit: "contain",
                                borderRadius: 12,
                                border: "1px solid #2a2a3a",
                                background: "#0a0a12",
                                display: "block",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                borderRadius: 12,
                                border: "1px dashed #2a2a40",
                                padding: "24px 16px",
                                textAlign: "center",
                                fontSize: 13,
                                color: "#5f8f78",
                                lineHeight: 1.5,
                              }}
                            >
                              Aperçu indisponible : ce post a été enregistré sans image stockée
                              ({post.file.name}). Ré-attache une image en modifiant le post si besoin.
                            </div>
                          )}
                          {post.file.url ? (
                            <button
                              type="button"
                              onClick={() =>
                                downloadAsset(post.file?.url, post.file?.name ?? "")
                              }
                              style={{
                                alignSelf: "flex-start",
                                border: "1px solid #f0409044",
                                borderRadius: 10,
                                padding: "10px 16px",
                                background: "#1a1a2a",
                                color: "#f472b6",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              ⬇ Télécharger l&apos;image
                            </button>
                          ) : null}
                        </div>
                      ) : post.file.kind === "pdf" && post.file.url ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div
                            style={{
                              width: "100%",
                              maxHeight: "min(50vh, 420px)",
                              borderRadius: 12,
                              border: "1px solid #2a2a3a",
                              background: "#0a0a12",
                              overflow: "hidden",
                            }}
                          >
                            <iframe
                              title={`Aperçu PDF — ${post.file.name}`}
                              src={pdfPreviewEmbedSrc(post.file.url)}
                              style={{
                                width: "100%",
                                height: "min(50vh, 420px)",
                                border: "none",
                                display: "block",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                downloadAsset(post.file?.url, post.file?.name ?? "")
                              }
                              style={{
                                border: "1px solid #f0409044",
                                borderRadius: 10,
                                padding: "10px 16px",
                                background: "#1a1a2a",
                                color: "#f472b6",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              ⬇ Télécharger le PDF
                            </button>
                            <a
                              href={post.file.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#f0a0c8",
                                textDecoration: "underline",
                              }}
                            >
                              Ouvrir dans un nouvel onglet
                            </a>
                          </div>
                        </div>
                      ) : post.file.url ? (
                        <a
                          href={post.file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "#1a1a2a",
                            borderRadius: 12,
                            padding: "14px 16px",
                            color: "#f04090",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          📄 {post.file.name}
                        </a>
                      ) : (
                        <div
                          style={{
                            borderRadius: 12,
                            border: "1px solid #2a2a40",
                            padding: "14px 16px",
                            fontSize: 13,
                            color: "#9090b8",
                          }}
                        >
                          📄 {post.file.name} — lien non enregistré
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Drawer.Body>

            <Drawer.Footer className="border-t border-[#1e1e30]">
              {post && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  {editing ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          flex: 1,
                          background: "#1a1a2a",
                          border: "1px solid #2a2a40",
                          borderRadius: 10,
                          padding: 10,
                          color: "#8888aa",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={!title.trim() || saving}
                        style={{
                          flex: 2,
                          background: title.trim() && !saving ? "#f04090" : "#2a2a3a",
                          border: "none",
                          borderRadius: 10,
                          padding: 10,
                          color: title.trim() && !saving ? "#fff" : "#5050a0",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: title.trim() && !saving ? "pointer" : "not-allowed",
                        }}
                      >
                        {saving ? "…" : "Enregistrer"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => void onDelete(post.id)}
                        style={{
                          flex: 1,
                          background: "#2a1a1a",
                          border: "1px solid #4a2020",
                          borderRadius: 10,
                          padding: 10,
                          color: "#e05050",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Supprimer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        style={{
                          flex: 1,
                          background: "#2a1020",
                          border: "1px solid #f0409060",
                          borderRadius: 10,
                          padding: 10,
                          color: "#f472b6",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        slot="close"
                        style={{
                          flex: 1,
                          background: "#1a1a2a",
                          border: "1px solid #2a2a40",
                          borderRadius: 10,
                          padding: 10,
                          color: "#8888aa",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Fermer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

// ─── YearView ─────────────────────────────────────────────────────────────────
function YearView({ year, posts, onMonthClick }: {
  year: number; posts: Post[]; onMonthClick: (m: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-[14px]">
      {MOIS_FR.map((name, mi) => {
        const mPosts = posts.filter(p => p.date.getFullYear() === year && p.date.getMonth() === mi);
        const isCur  = mi === today.getMonth() && year === today.getFullYear();
        return (
          <button
            key={mi} onClick={() => onMonthClick(mi)}
            style={{
              background: isCur ? "#141420" : "#10101a",
              border: `1px solid ${isCur ? "#f04090" : "#1e1e30"}`,
              borderRadius: 14, padding: "18px 16px",
              cursor: "pointer", textAlign: "left", color: "#f0f0ff",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#f04090")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = isCur ? "#f04090" : "#1e1e30")}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: isCur ? "#f04090" : "#c0c0e0", marginBottom: 6 }}>
              {name}
            </div>
            <div style={{ fontSize: 11, color: "#5050a0", marginBottom: 10 }}>
              {mPosts.length} post{mPosts.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {mPosts.slice(0, 6).map(p => (
                <span key={p.id} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: STATUS_COLOR[p.status], display: "inline-block",
                }} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main (client) ────────────────────────────────────────────────────────────
export function EditorialCalendarClient({ initialPosts }: { initialPosts: SerializedPost[] }) {
  const [view, setView]       = useState<ViewMode>("Mois");
  const [year, setYear]       = useState(CY);
  const [month, setMonth]     = useState(CM);
  const [weekOff, setWeekOff] = useState(0);
  const [posts, setPosts]     = useState<Post[]>(() => initialPosts.map(serializedToPost));

  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);

  // HeroUI v3 controlled state hooks
  const addState    = useOverlayState();
  const detailState = useOverlayState();

  const openAdd = useCallback((date: Date) => {
    setPendingDate(date);
    addState.open();
  }, [addState]);

  const openDetail = useCallback((post: Post) => {
    setCurrentPost(post);
    detailState.open();
  }, [detailState]);

  const handlePostCreated = useCallback((p: Post) => {
    setPosts((prev) => [...prev, p]);
  }, []);

  const handlePostUpdated = useCallback((p: Post) => {
    setPosts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setCurrentPost(p);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const res = await deleteCalendarPost(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setCurrentPost(null);
    detailState.close();
    toast.success("Post supprimé");
  }, [detailState]);

  const goNext = () => {
    if (view === "Année")   { setYear(y => y + 1); return; }
    if (view === "Semaine") { setWeekOff(w => w + 1); return; }
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
    setWeekOff(0);
  };
  const goPrev = () => {
    if (view === "Année")   { setYear(y => y - 1); return; }
    if (view === "Semaine") { setWeekOff(w => w - 1); return; }
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
    setWeekOff(0);
  };

  const monthCells = buildMonthGrid(year, month);
  const weekCells  = buildWeekGrid(year, month, weekOff);
  const monthDays = monthCells.filter(({ date }) => isSameMonth(date, year, month));

  const btnBase: React.CSSProperties = { border: "none", cursor: "pointer", transition: "all 0.15s" };

  return (
    <div
      className="min-h-[calc(100dvh-3.5rem)] text-[#f0f0ff] md:min-h-0"
      style={{
        background: "#0d0d14",
        fontFamily: "'DM Sans', 'Syne', sans-serif",
        padding: "12px 0 24px",
      }}
    >
      {/* ── HEADER ── */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1
            className="m-0 text-[clamp(1.65rem,5.5vw,2.625rem)] font-black leading-none tracking-tight lg:tracking-[-0.04em]"
          >
            {view === "Année" ? year : MOIS_FR[month]}
          </h1>
          <p className="mt-1.5 text-[10px] font-semibold tracking-[0.2em] text-[#5050a0] sm:mt-2">
            CALENDRIER ÉDITORIAL · {year}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:flex-nowrap lg:justify-end">
          {/* View toggle */}
          <div className="flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-full bg-[#1a1a2a] p-1 sm:flex-none sm:flex-nowrap">
            {(["Mois", "Semaine", "Année"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v);
                  setWeekOff(0);
                }}
                className="min-w-0 flex-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold sm:flex-none sm:px-3.5 sm:text-xs"
                style={{
                  ...btnBase,
                  background: view === v ? "#f04090" : "transparent",
                  color: view === v ? "#fff" : "#6060a0",
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex shrink-0 gap-1">
            {(["◀", "▶"] as const).map((arrow, i) => (
              <button
                key={arrow}
                onClick={i === 0 ? goPrev : goNext}
                className="flex size-9 items-center justify-center rounded-lg border border-[#2a2a40] bg-[#1a1a2a] text-[11px] text-[#6060a0]"
                style={btnBase}
              >
                {arrow}
              </button>
            ))}
          </div>

          {/* Add */}
          <button
            onClick={() => openAdd(today)}
            className="shrink-0 rounded-full bg-gradient-to-r from-[#f04090] to-[#f472b6] px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_#f0409044] sm:px-[18px] sm:text-[13px]"
            style={btnBase}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* ── VUE ANNÉE ── */}
      {view === "Année" && (
        <div className="rounded-[1.4rem] border border-[#f0409035] bg-[linear-gradient(180deg,rgba(240,64,144,0.09),rgba(16,16,26,0.95))] p-3 shadow-[0_0_34px_rgba(240,64,144,0.12)] sm:p-4">
          <YearView year={year} posts={posts} onMonthClick={m => {
            setMonth(m); setView("Mois"); setWeekOff(0);
          }} />
        </div>
      )}

      {/* ── VUE MOIS ── */}
      {view === "Mois" && (
        <div className="rounded-[1.4rem] border border-[#f0409035] bg-[linear-gradient(180deg,rgba(240,64,144,0.09),rgba(16,16,26,0.95))] p-3 shadow-[0_0_34px_rgba(240,64,144,0.12)] sm:p-4">
          {/* Mobile: vraie vue liste pour éviter la grille 7 colonnes écrasée */}
          <div className="space-y-3 md:hidden">
            {monthDays.map(({ date }) => {
              const dayPosts = posts.filter((p) => sameDay(p.date, date));
              const isTod = sameDay(date, today);
              return (
                <article
                  key={date.toISOString()}
                  className="rounded-xl border border-[#2b2030] bg-[#10101a] p-3"
                >
                  <button
                    type="button"
                    onClick={() => openAdd(date)}
                    className="mb-2 flex w-full items-center justify-between"
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: isTod ? "#f04090" : "#d0d0f0" }}
                    >
                      {JOURS_L[dowMon(date)]} {date.getDate()}
                    </span>
                    <span className="text-xs text-[#6060a0]">+ Ajouter</span>
                  </button>
                  {dayPosts.length === 0 ? (
                    <p className="text-xs text-[#6060a0]">Aucun post</p>
                  ) : (
                    <div className="space-y-2">
                      {dayPosts.map((p) => (
                        <PostPill key={p.id} post={p} onClick={() => openDetail(p)} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Desktop/tablette */}
          <div className="hidden md:block">
          <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[540px] sm:min-w-0">
              <div style={{ background: "#10101a", borderRadius: 16, overflow: "hidden", border: "1px solid #2b2030", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #1e1e30" }}>
                {JOURS_C.map((d) => (
                  <div
                    key={d}
                    className="px-0.5 py-2.5 text-center text-[9px] font-bold tracking-[0.12em] text-[#40407a] sm:text-[10px]"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, row) => (
                <div
                  key={row}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    borderBottom: row < 5 ? "1px solid #201a2b" : "none",
                  }}
                >
                  {monthCells.slice(row * 7, row * 7 + 7).map(({ date, current }, col) => {
                    const isTod = sameDay(date, today);
                    const dayPosts = posts.filter((p) => sameDay(p.date, date));
                    return (
                      <div
                        key={col}
                        className="min-h-[72px] px-1 py-1.5 sm:min-h-[100px] sm:px-2 sm:pb-2.5 sm:pt-2"
                        onClick={() => openAdd(date)}
                        style={{
                          borderRight: col < 6 ? "1px solid #201a2b" : "none",
                          background: isTod ? "#141420" : "transparent",
                          cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isTod) e.currentTarget.style.background = "#0f0f1a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isTod ? "#141420" : "transparent";
                        }}
                      >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{
                        fontSize: 12, fontWeight: isTod ? 800 : 500,
                        color: isTod ? "#f04090" : current ? "#6060a0" : "#252535",
                      }}>
                        {String(date.getDate()).padStart(2, "0")}
                      </span>
                      {isTod && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f04090", marginTop: 3 }} />}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {dayPosts.map(p => (
                        <PostPill key={p.id} post={p} onClick={() => openDetail(p)} />
                      ))}
                    </div>
                  </div>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── VUE SEMAINE ── */}
      {view === "Semaine" && (
        <div className="rounded-[1.4rem] border border-[#f0409035] bg-[linear-gradient(180deg,rgba(240,64,144,0.09),rgba(16,16,26,0.95))] p-3 shadow-[0_0_34px_rgba(240,64,144,0.12)] sm:p-4">
          {/* Mobile: liste des 7 jours */}
          <div className="space-y-3 md:hidden">
            {weekCells.map(({ date }) => {
              const dayPosts = posts.filter((p) => sameDay(p.date, date));
              const isTod = sameDay(date, today);
              return (
                <article
                  key={date.toISOString()}
                  className="rounded-xl border border-[#2b2030] bg-[#10101a] p-3"
                >
                  <button
                    type="button"
                    onClick={() => openAdd(date)}
                    className="mb-2 flex w-full items-center justify-between"
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: isTod ? "#f04090" : "#d0d0f0" }}
                    >
                      {JOURS_L[dowMon(date)]} {date.getDate()}
                    </span>
                    <span className="text-xs text-[#6060a0]">+ Ajouter</span>
                  </button>
                  {dayPosts.length === 0 ? (
                    <p className="text-xs text-[#6060a0]">Aucun post</p>
                  ) : (
                    <div className="space-y-2">
                      {dayPosts.map((p) => (
                        <PostPill key={p.id} post={p} onClick={() => openDetail(p)} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Desktop/tablette */}
          <div className="hidden md:block">
          <div className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[540px] sm:min-w-0">
              <div style={{ background: "#10101a", borderRadius: 16, overflow: "hidden", border: "1px solid #2b2030", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #1e1e30" }}>
                {weekCells.map(({ date }, i) => {
                  const isTod = sameDay(date, today);
                  return (
                    <div
                      key={i}
                      className="px-1 py-2.5 text-center sm:px-2 sm:py-3.5"
                      style={{ borderRight: i < 6 ? "1px solid #1e1e30" : "none" }}
                    >
                      <div className="mb-1 text-[9px] font-bold tracking-[0.12em] text-[#40407a] sm:text-[10px]">
                        {JOURS_L[i].toUpperCase().slice(0, 3)}
                      </div>
                      <div
                        className="text-lg font-black sm:text-2xl"
                        style={{
                          color: isTod ? "#f04090" : date.getMonth() === month ? "#d0d0f0" : "#303050",
                        }}
                      >
                        {date.getDate()}
                      </div>
                      {isTod && (
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f04090",
                            margin: "4px auto 0",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="grid min-h-[240px] grid-cols-7 sm:min-h-[320px]">
                {weekCells.map(({ date }, i) => {
                  const dayPosts = posts.filter((p) => sameDay(p.date, date));
                  return (
                    <div
                      key={i}
                      className="min-h-[160px] px-1 py-2 sm:min-h-[200px] sm:px-2 sm:py-3"
                      onClick={() => openAdd(date)}
                      style={{ borderRight: i < 6 ? "1px solid #201a2b" : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#0f0f1a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dayPosts.map(p => (
                      <PostPill key={p.id} post={p} onClick={() => openDetail(p)} />
                    ))}
                    {dayPosts.length === 0 && (
                      <div style={{ fontSize: 18, color: "#1e1e30", textAlign: "center", marginTop: 20 }}>+</div>
                    )}
                  </div>
                </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── DRAWERS ── */}
      <AddDrawer state={addState} initialDate={pendingDate} onPostCreated={handlePostCreated} />
      <DetailDrawer
        state={detailState}
        post={currentPost}
        onDelete={handleDelete}
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
}
