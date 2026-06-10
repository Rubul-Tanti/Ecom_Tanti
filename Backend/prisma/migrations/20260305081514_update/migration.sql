/*
  Warnings:

  - The primary key for the `Otp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expiresAt` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifyToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifyTokenExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- DropIndex
DROP INDEX "Otp_userId_idx";

-- DropIndex
DROP INDEX "User_emailVerifyToken_key";

-- AlterTable
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_pkey",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "isUsed",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerifyToken",
DROP COLUMN "emailVerifyTokenExpires",
DROP COLUMN "isEmailVerified";

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email");
