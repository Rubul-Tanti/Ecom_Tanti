/*
  Warnings:

  - You are about to drop the column `cartId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,size,productVariantId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";

-- DropIndex
DROP INDEX "CartItem_cartId_idx";

-- DropIndex
DROP INDEX "CartItem_cartId_productId_size_productVariantId_key";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "cartId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Cart";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_productId_size_productVariantId_key" ON "CartItem"("productId", "size", "productVariantId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
