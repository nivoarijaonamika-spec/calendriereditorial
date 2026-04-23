import AddUserDrawer from "@/components/add-user-drawer";
import { Chip, Avatar } from "@heroui/react";
import { prisma } from "@/lib/prisma";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  accountCount: number;
};

export default async function ManagerAccessPage() {
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u."id",
      u."name",
      u."email",
      u."createdAt",
      COUNT(a."id")::int AS "accountCount"
    FROM "user" u
    LEFT JOIN "account" a ON a."userId" = u."id"
    GROUP BY u."id"
    ORDER BY u."createdAt" DESC
  `;

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="min-h-0 text-[#f0f0ff]">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#f472b6]">
              Contrôle administratif
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-7xl">
              Gestion des accès
            </h1>
          </div>

          <AddUserDrawer />
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-[#10101a] md:block">
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
                        {initials(user.name?.trim() || "Utilisateur")}
                      </Avatar>

                      <div>
                        <p>{user.name?.trim() || "Utilisateur"}</p>
                        <p className="text-sm text-zinc-500">
                          Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-[#9090b8]">{user.email}</td>

                  <td className="px-6 py-5">
                    <Chip>Utilisateur</Chip>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={
                        user.accountCount > 0
                          ? "text-[#f472b6]"
                          : "italic text-[#6060a0]"
                      }
                    >
                      {user.accountCount > 0 ? "Actif" : "En attente"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-[#6060a0]">•••</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-white/10 bg-[#10101a] p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="bg-[#1a1a2a] text-[#f472b6]">
                  {initials(user.name?.trim() || "Utilisateur")}
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#f0f0ff]">
                    {user.name?.trim() || "Utilisateur"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <p className="mt-3 break-all text-sm text-[#9090b8]">{user.email}</p>
              <div className="mt-3 flex items-center justify-between">
                <Chip>Utilisateur</Chip>
                <span
                  className={
                    user.accountCount > 0
                      ? "text-sm text-[#f472b6]"
                      : "text-sm italic text-[#6060a0]"
                  }
                >
                  {user.accountCount > 0 ? "Actif" : "En attente"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}