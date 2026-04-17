"use client";

import {
  Card,
  Input,
  Checkbox,
  Button,
  Link,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

export function LoginCard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const loadingToast = toast.loading("Connexion en cours...");

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    toast.dismiss(loadingToast);

     if (result.error) {
    toast.error("Email ou mot de passe incorrect");
    setLoading(false);
    return;
  }

  toast.success("Connexion réussie");

  router.push("/dashboard");
  router.refresh();
  }

  return (
    <Card className="w-full max-w-md border border-white/10 bg-zinc-950/80 p-8 backdrop-blur-xl shadow-2xl">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white">
          Bon retour
        </h2>
        <p className="text-sm text-zinc-400">
          Entrez vos identifiants pour accéder au studio
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-zinc-400">
            Adresse email
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@calendrier.local"
            className="text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-zinc-400">
            Mot de passe
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="text-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox>
            <span className="text-sm text-zinc-400">
              Garder la session active
            </span>
          </Checkbox>

          <Link href="#" className="text-sm text-pink-500">
            Accès perdu ?
          </Link>
        </div>

        <Button
          onPress={handleLogin}
          className="w-full rounded-full bg-pink-500 py-6 text-black font-semibold"
        >
          {loading ? "Connexion..." : "Initialiser la session"}
        </Button>
      </div>
    </Card>
  );
}