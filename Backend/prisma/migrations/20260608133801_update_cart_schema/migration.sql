/*
  Warnings:

  - You are about to drop the column `color` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,productId,size,productVariantId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productVariantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_size_color_key";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "color",
ADD COLUMN     "productVariantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_size_productVariantId_key" ON "CartItem"("cartId", "productId", "size", "productVariantId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
