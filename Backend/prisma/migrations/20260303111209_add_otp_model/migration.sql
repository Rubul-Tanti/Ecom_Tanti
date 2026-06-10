/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpires",
DROP COLUMN "emailVerified";

-- CreateTable
CREATE TABLE "Otp" (
    "email" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email");

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");
