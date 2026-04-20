'use client';

import { Card, Switch, Button } from '@heroui/react';

export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 text-[#f0f0ff]">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#f472b6]">Compte</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-2 text-[#6060a0]">
          Préférences de l’espace éditorial Nocturne.
        </p>
      </div>

      <Card className="border border-white/10 bg-[#10101a] shadow-none">
        <Card.Header className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#f0f0ff]">Notifications</h2>
          <p className="text-sm text-[#6060a0]">Alertes liées au calendrier et aux publications.</p>
        </Card.Header>
        <Card.Content className="space-y-6 px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Rappels de publication</p>
              <p className="text-sm text-[#6060a0]">Email 24h avant une date planifiée</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Résumé hebdomadaire</p>
              <p className="text-sm text-[#6060a0]">Vue d’ensemble chaque lundi</p>
            </div>
            <Switch />
          </div>
        </Card.Content>
      </Card>

      <Card className="border border-white/10 bg-[#10101a] shadow-none">
        <Card.Header className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#f0f0ff]">Apparence</h2>
          <p className="text-sm text-[#6060a0]">Thème fixe : mode sombre avec accent rose.</p>
        </Card.Header>
        <Card.Content className="px-6 py-6">
          <div className="rounded-2xl border border-[#f04090]/25 bg-[#0d0d14] p-4">
            <p className="text-sm text-[#9090b8]">
              L’interface utilise le thème <span className="font-semibold text-[#f04090]">Nocturne</span>{' '}
              (fond <span className="text-[#f0f0ff]">#0d0d14</span>, accent{' '}
              <span className="text-[#f472b6]">#f04090</span>).
            </p>
          </div>
        </Card.Content>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" className="text-[#9090b8]">
          Annuler
        </Button>
        <Button className="bg-[#f04090] font-semibold text-white shadow-[0_0_20px_rgba(240,64,144,0.35)]">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
