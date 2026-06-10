/*
  Warnings:

  - The `refundable` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `returnable` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `isActive` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `isFeatured` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `isPrimary` column on the `ProductImage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "refundable",
ADD COLUMN     "refundable" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "returnable",
ADD COLUMN     "returnable" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "isActive",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "isFeatured",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "isPrimary",
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "Status";

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");
