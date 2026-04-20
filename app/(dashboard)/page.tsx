import Link from 'next/link';

export default function DashboardRootPage() {
  return (
    <main className="min-h-0 text-[#f0f0ff]">
      <p className="text-xs uppercase tracking-[0.35em] text-[#f472b6]">Espace connecté</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#f04090]">
        Bienvenue
      </h1>
      <p className="mt-4 max-w-md text-[#6060a0]">
        Connexion réussie. Utilise la barre latérale pour accéder au tableau de bord, au calendrier
        éditorial et aux autres sections.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex rounded-full border border-[#f04090]/40 bg-[#f04090]/10 px-6 py-2.5 text-sm font-semibold text-[#f472b6] transition hover:bg-[#f04090]/20"
      >
        Ouvrir le tableau de bord
      </Link>
    </main>
  );
}