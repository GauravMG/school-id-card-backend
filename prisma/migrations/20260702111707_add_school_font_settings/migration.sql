-- CreateEnum
CREATE TYPE "FontSlot" AS ENUM ('HEADER', 'NAME', 'LABEL', 'BODY');

-- CreateTable
CREATE TABLE "SchoolFontSetting" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "slot" "FontSlot" NOT NULL,
    "fontFamily" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolFontSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolFontSetting_schoolId_slot_key" ON "SchoolFontSetting"("schoolId", "slot");

-- AddForeignKey
ALTER TABLE "SchoolFontSetting" ADD CONSTRAINT "SchoolFontSetting_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
