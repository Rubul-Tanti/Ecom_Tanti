/*
  Warnings:

  - The values [FACEBOOK] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('EMAIL', 'GOOGLE');
ALTER TABLE "public"."User" ALTER COLUMN "authProvider" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "authProvider" TYPE "AuthProvider_new" USING ("authProvider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
ALTER TABLE "User" ALTER COLUMN "authProvider" SET DEFAULT 'EMAIL';
COMMIT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "colorName" TEXT;
