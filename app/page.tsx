import { BackgroundGlow } from "@/components/home/background-glow";
import { LoginCard } from "@/components/home/login-card";
import { StatusPanel } from "@/components/home/status-panel";



export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundGlow />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-pink-500">
           Viviworks.AI
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Le moteur éditorial haut de gamme
          </p>
        </div>

        <LoginCard />

        
      </section>
    </main>
  );
}