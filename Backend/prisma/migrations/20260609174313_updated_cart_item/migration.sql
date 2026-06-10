/*
  Warnings:

  - You are about to drop the column `deleveryCharge` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "deleveryCharge",
ADD COLUMN     "deliveryCharge" INTEGER;
