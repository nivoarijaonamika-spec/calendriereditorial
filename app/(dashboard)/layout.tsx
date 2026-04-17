import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";   // ← Assure-toi que le chemin est correct

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vérification de session (Server Component)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("SESSION:", session);

  if (!session) {
    redirect("/");
  }

  // Layout protégé avec Sidebar
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar fixe à gauche */}
      <Sidebar />

      {/* Contenu principal avec décalage */}
      <main className="flex-1 ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}