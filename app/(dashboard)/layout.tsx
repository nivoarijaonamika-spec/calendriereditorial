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
    <div className="flex min-h-screen bg-[#0d0d14]">
      <Sidebar />

      <main className="ml-64 min-h-screen flex-1 border-l border-[#f04090]/10 bg-[#0d0d14] p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}