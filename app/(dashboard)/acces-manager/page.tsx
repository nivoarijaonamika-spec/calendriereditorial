"use client";

import AddUserDrawer from "@/components/add-user-drawer";
import { Button, Chip, Avatar } from "@heroui/react";

export default function ManagerAccessPage() {
  const users = [
    {
      id: 1,
      name: "Elena Rodriguez",
      meta: "Rejoint il y a 2 mois",
      email: "e.rodriguez@nocturne.io",
      role: "Admin",
      status: "Actif",
    },
    {
      id: 2,
      name: "Marcus Chen",
      meta: "Invitation envoyée il y a 4h",
      email: "m.chen@studio.design",
      role: "Éditeur",
      status: "En attente",
    },
  ];

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="min-h-0 text-[#f0f0ff]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#f472b6]">
              Contrôle administratif
            </p>
            <h1 className="text-5xl font-semibold md:text-7xl">
              Gestion des accès
            </h1>
          </div>

          <AddUserDrawer />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#10101a]">
          <table className="w-full">
            <thead className="border-b border-white/5 text-left text-xs uppercase tracking-[0.25em] text-zinc-500">
              <tr>
                <th className="px-6 py-5">Membre</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5">Rôle</th>
                <th className="px-6 py-5">Statut</th>
                <th className="px-6 py-5">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-[#1a1a2a] text-[#f472b6]">
                        {initials(user.name)}
                      </Avatar>

                      <div>
                        <p>{user.name}</p>
                        <p className="text-sm text-zinc-500">{user.meta}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-[#9090b8]">{user.email}</td>

                  <td className="px-6 py-5">
                    <Chip >
                      {user.role}
                    </Chip>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={
                        user.status === "Actif"
                          ? "text-[#f472b6]"
                          : "italic text-[#6060a0]"
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-[#6060a0]">•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}