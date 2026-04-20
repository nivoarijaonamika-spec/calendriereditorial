"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  console.log("=== Début connexion ===");
  console.log("Email:", email);

  const response = await auth.api.signInEmail({
    headers: await headers(),
    body: {
      email,
      password,
    },
    asResponse: true,
  });

  console.log("=== Réponse brute ===");
  console.log(response);

  redirect("/dashboard");
}