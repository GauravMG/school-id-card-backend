-- CreateEnum
CREATE TYPE "StudentStream" AS ENUM ('ARTS', 'COMMERCE', 'SCIENCE_MEDICAL', 'SCIENCE_NON_MEDICAL');

-- CreateEnum
CREATE TYPE "CommuteMode" AS ENUM ('SELF', 'WITH_PARENT', 'SCHOOL_TRANSPORT');

-- CreateEnum
CREATE TYPE "PageSize" AS ENUM ('A3', 'A4');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "commuteMode" "CommuteMode",
ADD COLUMN     "stream" "StudentStream";

-- CreateTable
CREATE TABLE "ExportSetting" (
    "id" TEXT NOT NULL,
    "pageSize" "PageSize" NOT NULL,
    "cardsPerPage" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlContent" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExportSetting_pageSize_key" ON "ExportSetting"("pageSize");

-- CreateIndex
CREATE INDEX "CardTemplate_isActive_idx" ON "CardTemplate"("isActive");
