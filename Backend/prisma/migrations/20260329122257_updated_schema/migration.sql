/*
  Warnings:

  - Changed the type of `refundable` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `returnable` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `isActive` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `isFeatured` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `isPrimary` on the `ProductImage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('true', 'false');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "refundable",
ADD COLUMN     "refundable" "Status" NOT NULL,
DROP COLUMN "returnable",
ADD COLUMN     "returnable" "Status" NOT NULL,
DROP COLUMN "isActive",
ADD COLUMN     "isActive" "Status" NOT NULL,
DROP COLUMN "isFeatured",
ADD COLUMN     "isFeatured" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "isPrimary",
ADD COLUMN     "isPrimary" "Status" NOT NULL;

-- DropEnum
DROP TYPE "status";

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");
