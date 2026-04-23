-- CreateEnum
CREATE TYPE "EditorialPostStatus" AS ENUM ('PUBLIE', 'BROUILLON', 'PLANIFIE');

-- CreateEnum
CREATE TYPE "EditorialPostType" AS ENUM ('ARTICLE', 'PODCAST', 'VIDEO', 'IMAGE');

-- CreateTable
CREATE TABLE "editorial_post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EditorialPostStatus" NOT NULL,
    "type" "EditorialPostType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileKind" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "editorial_post_userId_scheduledAt_idx" ON "editorial_post"("userId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "editorial_post" ADD CONSTRAINT "editorial_post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
