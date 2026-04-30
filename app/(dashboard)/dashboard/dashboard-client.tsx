'use client';

import { useRouter } from 'next/navigation';
import { Card, Chip, Button } from '@heroui/react';
import type { DashboardStats } from '@/lib/data/dashboard-stats';

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const router = useRouter();
  const {
    userDisplayName,
    todayLabel,
    scheduledCount,
    publishedCount,
    upcomingCount,
    membersCount,
    weekVelocity,
    weekDayLabels,
    weekMax,
    latestPostTitle,
    draftsCount,
  } = stats;

  return (
    <div className="min-h-0 text-[#f0f0ff]">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold">
          Bonjour, <span className="text-[#f04090]">{userDisplayName}</span>
        </h1>
        <p className="mt-1 text-[#6060a0]">
          Vue d’ensemble éditoriale — {todayLabel}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-white/5 bg-[#10101a] shadow-none">
          <Card.Content className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f04090]/30 bg-[#f04090]/10 text-[#f472b6]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 2.75v2.5M16 2.75v2.5M3.75 9h16.5M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v11.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
                </svg>
              </span>
              <Chip color="success" variant="soft" size="sm">
                Planifiés
              </Chip>
            </div>
            <div>
              <p className="text-5xl font-semibold text-white">{scheduledCount}</p>
              <p className="mt-1 text-sm text-[#6060a0]">POSTS PLANIFIÉS</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/5 bg-[#10101a] shadow-none">
          <Card.Content className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.2 4.2L19 6.5" />
                </svg>
              </span>
              <Chip color="success" variant="soft" size="sm">
                Publiés
              </Chip>
            </div>
            <div>
              <p className="text-5xl font-semibold text-white">{publishedCount}</p>
              <p className="mt-1 text-sm text-[#6060a0]">POSTS PUBLIÉS</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/5 bg-[#10101a] shadow-none">
          <Card.Content className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0-15 5.25 5.25M12 4.5 6.75 9.75" />
                </svg>
              </span>
              <Chip variant="soft" size="sm">
                À venir
              </Chip>
            </div>
            <div>
              <p className="text-5xl font-semibold text-white">{upcomingCount}</p>
              <p className="mt-1 text-sm text-[#6060a0]">
                PLANIFIÉS (DATE ≥ AUJOURD’HUI)
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card className="border border-white/5 bg-[#10101a] shadow-none">
          <Card.Content className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" />
                </svg>
              </span>
              <Chip color="default" variant="soft" size="sm">
                App
              </Chip>
            </div>
            <div>
              <p className="text-5xl font-semibold text-white">{membersCount}</p>
              <p className="mt-1 text-sm text-[#6060a0]">COMPTES UTILISATEURS</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="border border-white/5 bg-[#10101a] shadow-none lg:col-span-3">
          <Card.Header className="px-6 pb-0 pt-6">
            <div className="flex w-full items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Rythme sur 7 jours</h2>
                <p className="text-sm text-[#6060a0]">
                  Nombre de posts par jour (selon la date planifiée)
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" isDisabled className="opacity-80">
                  7 JOURS
                </Button>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="px-6 pb-6">
            <div className="mt-8 flex h-80 items-end gap-4">
              {weekVelocity.map((val, i) => {
                const heightPct =
                  val === 0 ? 0 : weekMax > 0 ? (val / weekMax) * 100 : 0;
                const isPeak =
                  val > 0 && val === Math.max(...weekVelocity);
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="relative flex w-full justify-center">
                      <div
                        className={`w-full max-w-[42px] rounded-t-2xl transition-all ${
                          isPeak
                            ? 'bg-[#f04090]'
                            : 'bg-gradient-to-t from-[#c03070] to-[#f472b6]'
                        }`}
                        style={{
                          height: `${val === 0 ? 0 : Math.max(heightPct, 6)}%`,
                        }}
                      />
                      {isPeak && val > 0 && (
                        <div className="absolute -top-8 rounded-full bg-[#f04090] px-3 py-1 text-xs font-medium text-white">
                          {val}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#6060a0]">{weekDayLabels[i]}</span>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        <Card className="flex flex-col border border-white/5 bg-[#10101a] shadow-none lg:col-span-2">
          <Card.Content className="flex h-full flex-col p-6">
            <Chip color="danger" variant="soft" className="mb-6 w-fit">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-400" />
                </span>
                ACTIVITÉ
              </span>
            </Chip>

            <h3 className="mb-6 text-3xl font-semibold leading-tight">
              Brouillons & dernier mouvement
            </h3>

            <p className="flex-1 text-[15px] leading-relaxed text-[#9090b8]">
              {draftsCount > 0 || latestPostTitle ? (
                <>
                  <span className="font-semibold text-[#f0f0ff]">{draftsCount}</span>{' '}
                  brouillon{draftsCount > 1 ? 's' : ''} en cours
                  {latestPostTitle ? (
                    <>
                      . Dernière mise à jour sur :{' '}
                      <span className="italic text-[#f472b6]">{latestPostTitle}</span>
                    </>
                  ) : (
                    '.'
                  )}
                </>
              ) : (
                'Crée ton premier post depuis le calendrier éditorial pour alimenter ces statistiques.'
              )}
            </p>

            <div className="mt-10 flex items-center justify-between">
              <div className="flex -space-x-3">
                <div className="h-8 w-8 rounded-full border-2 border-[#10101a] bg-[#2a2a3a]" />
                <div className="h-8 w-8 rounded-full border-2 border-[#10101a] bg-[#f04090]" />
              </div>

              <Button
                variant="ghost"
                onPress={() => router.push('/calendrier-editorial')}
              >
                CALENDRIER
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
