/*
  Warnings:

  - Added the required column `Price` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductColorName` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productImageUrl` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "Price" INTEGER NOT NULL,
ADD COLUMN     "ProductColorName" TEXT NOT NULL,
ADD COLUMN     "productImageUrl" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;
