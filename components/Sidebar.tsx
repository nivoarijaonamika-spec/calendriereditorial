"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, Button, Avatar } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: sessionPayload } = authClient.useSession();
  const connectedUser = sessionPayload?.user;
  const userDisplayName =
    connectedUser?.name?.trim() ||
    connectedUser?.email?.split("@")[0] ||
    "Utilisateur";
  const userEmail = connectedUser?.email ?? "Aucun email";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  async function Deconnexion() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      alert("Une erreur est survenue lors de la déconnexion.");
    }
  }

  const navItems = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
    },
    {
      name: "Calendrier éditorial",
      href: "/calendrier-editorial",
    },
    {
      name: "Accès manager",
      href: "/acces-manager",
    },
    {
      name: "Paramètres",
      href: "/parametres",
    },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[70] flex h-14 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-md md:hidden">
        <span className="truncate text-lg font-bold tracking-tight text-[#f04090]">Viviworks.AI</span>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-10 min-w-[5.5rem] shrink-0 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-medium text-[#f0f0ff] transition-colors hover:border-[#f04090]/40 hover:bg-white/5"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? "Fermer" : "Menu"}
        </button>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed bottom-0 left-0 right-0 top-14 z-[55] bg-black/65 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Card
        id="app-sidebar"
        className={[
          "fixed left-0 z-[60] flex w-64 max-w-[min(100vw,18rem)] flex-col rounded-none border-r border-[#f04090]/15 bg-black shadow-xl shadow-black/40",
          "transition-transform duration-200 ease-out",
          "top-14 h-[calc(100dvh-3.5rem)] max-md:rounded-r-2xl max-md:border-y max-md:border-r max-md:border-l-0",
          "md:top-0 md:z-50 md:h-screen md:max-w-none md:rounded-none md:border-y-0 md:border-l md:border-r",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        <Card.Header className="border-b border-white/10 px-6 pb-6 pt-8 text-right">
          <div className="hidden flex-col items-end gap-0.5 md:flex">
            <span className="text-3xl font-bold tracking-tight text-[#f04090]">Viviworks.AI</span>
            <p className="text-[10px] font-medium tracking-[1.5px] text-[#6060a0]">EDITORIAL SAAS</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 md:hidden">
            <span className="text-xl font-bold tracking-tight text-[#f04090]">Menu</span>
            <p className="text-[10px] font-medium tracking-[1.5px] text-[#6060a0]">NAVIGATION</p>
          </div>
        </Card.Header>

        <Card.Content className="flex-1 overflow-y-auto px-3 py-6">
          <nav className="flex flex-col items-end gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href} className="block w-full" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant={isActive ? "primary" : "ghost"}
                    className={`h-12 w-full justify-end rounded-3xl px-5 text-sm font-medium transition-all duration-200
                                        ${
                                          isActive
                                            ? "bg-[#f04090] text-white shadow-[0_0_20px_rgba(240,64,144,0.35)] hover:bg-[#e03684]"
                                            : "text-[#9090b8] hover:bg-white/5 hover:text-[#f0f0ff]"
                                        }`}
                  >
                    <span className="truncate">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </Card.Content>

        <Card.Footer className="mt-auto border-t border-white/10 bg-black p-4">
          <div className="flex w-full items-center gap-x-3 rounded-3xl border border-white/10 bg-[#0a0a0a] p-3">
            <Avatar size="md" className="flex-shrink-0">
              <Avatar.Fallback>
                <span className="text-sm font-semibold text-[#f04090]">
                  {userDisplayName.slice(0, 1).toUpperCase()}
                </span>
              </Avatar.Fallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#f0f0ff]">
                {userDisplayName}
              </div>
              <div className="truncate text-xs font-medium text-[#f472b6]">
                {userEmail}
              </div>
            </div>

            <button
              className="flex h-8 shrink-0 items-center justify-center rounded-full px-3 text-xs font-medium text-[#9090b8] transition-all duration-200 hover:bg-[#f04090]/10 hover:text-[#f04090]"
              title="Se déconnecter"
              type="button"
              onClick={Deconnexion}
            >
              Sortir
            </button>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
}
