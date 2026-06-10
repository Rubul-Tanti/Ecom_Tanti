-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
