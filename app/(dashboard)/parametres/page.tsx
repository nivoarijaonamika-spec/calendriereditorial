"use client";

import { useState } from "react";
import { Card, Input, Button } from "@heroui/react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function formatDateFr(iso: string | Date | undefined) {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ParametresPage() {
  const { data: sessionPayload, isPending, refetch } = authClient.useSession();
  const user = sessionPayload?.user;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const canSubmitPassword =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 8 &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  async function handleChangePassword() {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("Renseigne le mot de passe actuel et le nouveau.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("Le nouveau mot de passe doit être différent de l’actuel.");
      return;
    }

    setPasswordLoading(true);
    const loadingId = toast.loading("Mise à jour du mot de passe…");
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.dismiss(loadingId);
      if (result.error) {
        toast.error(
          result.error.message?.trim() ||
            "Mot de passe actuel incorrect ou règles non respectées.",
        );
        return;
      }
      toast.success("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refetch();
    } catch {
      toast.dismiss(loadingId);
      toast.error("Une erreur est survenue.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-1 text-[#f0f0ff] sm:space-y-8 sm:px-0">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#f472b6]">Compte</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Paramètres</h1>
        <p className="mt-2 text-[#6060a0]">Profil et sécurité du compte connecté.</p>
      </div>

      {isPending ? (
        <p className="text-sm text-[#6060a0]">Chargement du profil…</p>
      ) : !user ? (
        <p className="text-sm text-[#6060a0]">Aucune session utilisateur.</p>
      ) : (
        <>
          <Card className="border border-white/10 bg-[#10101a] shadow-none">
            <Card.Header className="border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-[#f0f0ff]">Mon profil</h2>
              <p className="text-sm text-[#6060a0]">Informations du compte connecté.</p>
            </Card.Header>
            <Card.Content className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name ? `Avatar — ${user.name}` : "Avatar du compte"}
                    className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-16 sm:w-16"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#1a1a2a] text-xl font-bold text-[#f472b6] sm:h-16 sm:w-16 sm:text-2xl">
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-[#141422] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6060a0]">
                        Nom
                      </p>
                      <p className="mt-1 text-[#f0f0ff]">{user.name?.trim() || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#141422] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6060a0]">
                        E-mail
                      </p>
                      <p className="mt-1 break-all text-[#f0f0ff]">{user.email}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#141422] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6060a0]">
                        E-mail vérifié
                      </p>
                      <p className="mt-1 text-[#f0f0ff]">
                        {user.emailVerified ? "Oui" : "Non"}
                      </p>
                    </div>
                    {"createdAt" in user && user.createdAt != null ? (
                      <div className="rounded-xl border border-white/10 bg-[#141422] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6060a0]">
                          Compte créé le
                        </p>
                        <p className="mt-1 text-[#f0f0ff]">
                          {formatDateFr(
                            user.createdAt as string | Date | undefined,
                          )}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6060a0]">
                      Info
                    </p>
                    <p className="mt-1 text-xs text-[#6060a0]">
                      Les informations de profil proviennent de Better Auth et de la session active.
                    </p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card className="border border-white/10 bg-[#10101a] shadow-none">
            <Card.Header className="border-b border-white/10 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-[#f0f0ff]">Mot de passe</h2>
              <p className="text-sm text-[#6060a0]">
                Compte e-mail / mot de passe uniquement (connexion actuelle).
              </p>
            </Card.Header>
            <Card.Content className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="current-password"
                  className="text-xs uppercase tracking-wider text-[#6060a0]"
                >
                  Mot de passe actuel
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-[#f0f0ff]"
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="new-password"
                  className="text-xs uppercase tracking-wider text-[#6060a0]"
                >
                  Nouveau mot de passe
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="w-full text-[#f0f0ff]"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirm-password"
                  className="text-xs uppercase tracking-wider text-[#6060a0]"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-[#f0f0ff]"
                  autoComplete="new-password"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-[#141422] p-3 text-xs text-[#6060a0]">
                Le mot de passe doit contenir au moins 8 caractères et être différent de l’actuel.
              </div>
              <Button
                onPress={() => void handleChangePassword()}
                isDisabled={passwordLoading || !canSubmitPassword}
                className="mt-2 w-full bg-gradient-to-r from-[#f04090] to-[#f472b6] font-semibold text-white shadow-[0_0_20px_rgba(240,64,144,0.35)] sm:w-auto"
              >
                {passwordLoading ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
              </Button>
            </Card.Content>
          </Card>
        </>
      )}
    </div>
  );
}
