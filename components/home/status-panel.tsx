import { Card } from "@heroui/react";

export function StatusPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-white/10 bg-zinc-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-pink-500">
          Statut
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          Tous les systèmes éditoriaux sont opérationnels.
        </p>
      </Card>

      <Card className="border border-white/10 bg-zinc-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Session
        </p>
        <p className="mt-2 text-sm text-zinc-300">
          v4.8.2 Couche sécurisée active.
        </p>
      </Card>
    </div>
  );
}