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
    <Card className="w-full max-w-md border border-white/10 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="w-full space-y-2">
        <h2 className="text-3xl font-semibold text-white">
          Bon retour
        </h2>
        <p className="text-sm text-zinc-400">
          Entrez vos identifiants pour accéder au studio
        </p>
      </div>

      <div className="mt-8 flex w-full flex-col gap-6">
        <div className="flex w-full min-w-0 flex-col gap-2">
          <label
            htmlFor="login-email"
            className="block w-full text-xs uppercase tracking-widest text-zinc-400"
          >
            Adresse email
          </label>
          <Input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@calendrier.local"
            className="w-full min-w-0 text-white"
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2">
          <label
            htmlFor="login-password"
            className="block w-full text-xs uppercase tracking-widest text-zinc-400"
          >
            Mot de passe
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-w-0 text-white"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Checkbox>
            <span className="text-sm text-zinc-400">
              Garder la session active
            </span>
          </Checkbox>

          <Link href="#" className="text-sm text-pink-500 sm:text-right">
            Accès perdu ?
          </Link>
        </div>

        <Button
          onPress={handleLogin}
          className="w-full min-w-0 rounded-full bg-pink-500 py-6 font-semibold text-black"
        >
          {loading ? "Connexion..." : "Initialiser la session"}
        </Button>
      </div>
    </Card>
  );
}