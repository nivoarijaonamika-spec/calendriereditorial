import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

const seedUser = {
  email: process.env.SEED_USER_EMAIL ?? "admin@calendrier.com",
  password: process.env.SEED_USER_PASSWORD ?? "Admin12345!",
  name: process.env.SEED_USER_NAME ?? "Admin",
};

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: seedUser.email },
    include: {
      accounts: true,
    },
  });

  if (existingUser?.accounts?.length) {
    console.log(`Utilisateur déjà correctement créé : ${seedUser.email}`);
    return;
  }

  if (existingUser) {
    console.log("Utilisateur incomplet détecté → suppression...");

    await prisma.account.deleteMany({
      where: {
        userId: existingUser.id,
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId: existingUser.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: existingUser.id,
      },
    });
  }

  await auth.api.signUpEmail({
    body: seedUser,
  });

  console.log("✅ Utilisateur seed créé avec succès");
  console.log(`Email: ${seedUser.email}`);
  console.log(`Mot de passe: ${seedUser.password}`);
}

main()
  .catch((error) => {
    console.error("Erreur pendant la seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });