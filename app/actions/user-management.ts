"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type CreateUserInput = {
  email: string;
  password: string;
};

export async function createManagedUser(
  input: CreateUserInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!email || !password) {
    return { ok: false, error: "Email et mot de passe requis." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { ok: false, error: "Session invalide." };
  }

  const fallbackName = email.split("@")[0] || "Utilisateur";
  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: fallbackName,
    },
  });

  return { ok: true };
}
