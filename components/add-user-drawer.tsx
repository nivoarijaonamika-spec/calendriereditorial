"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  useOverlayState,
  Input,
  Button,
} from "@heroui/react";
import toast from "react-hot-toast";
import { createManagedUser } from "@/app/actions/user-management";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AddUserDrawer() {
  const router = useRouter();
  const state = useOverlayState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const emailError = email.trim().length > 0 && !isValidEmail(email.trim());
  const passwordError = password.trim().length > 0 && password.trim().length < 8;
  const canCreate =
    !saving &&
    isValidEmail(email.trim()) &&
    password.trim().length >= 8;

  async function handleCreate(): Promise<void> {
    if (!canCreate) return;
    setSaving(true);
    const loadingId = toast.loading("Création en cours...");
    try {
      const result = await createManagedUser({
        email,
        password,
      });
      if (!result.ok) {
        toast.dismiss(loadingId);
        toast.error(result.error);
        return;
      }
      toast.dismiss(loadingId);
      toast.success("Utilisateur créé avec succès.");
      state.close();
      resetForm();
      router.refresh();
    } catch {
      toast.dismiss(loadingId);
      toast.error("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        onPress={() => state.open()}
        className="rounded-full bg-[#f04090] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(240,64,144,0.35)] sm:px-8 sm:text-base"
      >
        + Ajouter
      </Button>

      <Drawer state={state}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] bg-[#10101a] text-[#f0f0ff] sm:max-w-md">
              <Drawer.CloseTrigger
                className="absolute right-4 top-4 text-[#6060a0] transition-colors hover:text-[#f0f0ff]"
                onClick={resetForm}
              />

              <Drawer.Header className="border-b border-white/10 pb-4 pr-12">
                <Drawer.Heading className="text-lg font-black text-[#f0f0ff]">
                  Ajouter un utilisateur
                </Drawer.Heading>
                <p className="mt-1 text-xs text-[#6060a0]">
                  Renseigne uniquement l&apos;email et le mot de passe.
                </p>
              </Drawer.Header>

              <Drawer.Body className="space-y-4 overflow-y-auto px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
                <div className="space-y-2 flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Adresse email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@email.com"
                  />
                  {emailError ? (
                    <p className="text-xs text-[#f472b6]">Adresse email invalide.</p>
                  ) : null}
                </div>

                <div className="space-y-2 flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                  />
                  {passwordError ? (
                    <p className="text-xs text-[#f472b6]">Minimum 8 caractères.</p>
                  ) : null}
                </div>
              </Drawer.Body>

              <Drawer.Footer className="border-t border-white/10 px-4 py-4 sm:px-6">
                <div className="flex w-full gap-2 sm:gap-3">
                  <Button
                    className="min-w-[96px] flex-1 sm:flex-none"
                    isDisabled={saving}
                    onPress={() => {
                      state.close();
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>

                  <Button
                    isDisabled={!canCreate}
                    className="min-w-[120px] flex-1 bg-[#f04090] font-semibold text-white sm:flex-none"
                    onPress={() => void handleCreate()}
                  >
                    {saving ? "Création..." : "Créer"}
                  </Button>
                </div>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}