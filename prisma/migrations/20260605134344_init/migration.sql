-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SHOP_ADMIN', 'TRANSLATOR');

-- CreateEnum
CREATE TYPE "LanguagePair" AS ENUM ('AM_EN', 'EN_AM', 'AM_OR', 'EN_OR');

-- CreateEnum
CREATE TYPE "TrustTier" AS ENUM ('CANDIDATE', 'GOLD');

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataRightsOk" BOOLEAN NOT NULL DEFAULT false,
    "qualityGrade" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "targetText" TEXT,
    "languagePair" "LanguagePair" NOT NULL,
    "trustTier" "TrustTier" NOT NULL DEFAULT 'CANDIDATE',
    "qualityGrade" DOUBLE PRECISION,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "provenance" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegmentEdit" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "aiSuggestion" TEXT,
    "humanCorrection" TEXT,
    "reviewerEmail" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "editDistance" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "sourceTerm" TEXT NOT NULL,
    "targetTerm" TEXT NOT NULL,
    "languagePair" "LanguagePair" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TMXImport" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "segmentCount" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TMXImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationEvent" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "languagePair" "LanguagePair" NOT NULL,
    "timeSpentMs" INTEGER,
    "editDistance" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopUser_email_key" ON "ShopUser"("email");

-- CreateIndex
CREATE INDEX "Segment_projectId_idx" ON "Segment"("projectId");

-- CreateIndex
CREATE INDEX "Segment_languagePair_trustTier_idx" ON "Segment"("languagePair", "trustTier");

-- CreateIndex
CREATE INDEX "SegmentEdit_segmentId_idx" ON "SegmentEdit"("segmentId");

-- CreateIndex
CREATE INDEX "GlossaryTerm_shopId_languagePair_idx" ON "GlossaryTerm"("shopId", "languagePair");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_shopId_sourceTerm_languagePair_key" ON "GlossaryTerm"("shopId", "sourceTerm", "languagePair");

-- CreateIndex
CREATE INDEX "ValidationEvent_segmentId_idx" ON "ValidationEvent"("segmentId");

-- CreateIndex
CREATE INDEX "ValidationEvent_eventType_createdAt_idx" ON "ValidationEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "ShopUser" ADD CONSTRAINT "ShopUser_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentEdit" ADD CONSTRAINT "SegmentEdit_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryTerm" ADD CONSTRAINT "GlossaryTerm_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TMXImport" ADD CONSTRAINT "TMXImport_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationEvent" ADD CONSTRAINT "ValidationEvent_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
