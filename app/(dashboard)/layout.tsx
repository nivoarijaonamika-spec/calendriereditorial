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

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d14]">
      <Sidebar />

      <main className="min-h-screen flex-1 border-[#f04090]/10 bg-[#0d0d14] pt-14 md:ml-64 md:border-l md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}