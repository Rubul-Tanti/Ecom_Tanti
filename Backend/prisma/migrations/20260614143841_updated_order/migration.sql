/*
  Warnings:

  - Added the required column `razorPayOrderId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "razorPayOrderId" TEXT NOT NULL;
