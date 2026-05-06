/*
  Warnings:

  - You are about to drop the column `benefits` on the `sponsorships` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `sponsorships` table. All the data in the column will be lost.
  - Added the required column `businessEmail` to the `sponsorships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `sponsorships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `sponsorships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `sponsorships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sponsorships` DROP FOREIGN KEY `sponsorships_userId_fkey`;

-- AlterTable
ALTER TABLE `sponsorships` DROP COLUMN `benefits`,
    DROP COLUMN `businessId`,
    ADD COLUMN `businessEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `businessIds` JSON NULL,
    ADD COLUMN `businessName` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `amount` DOUBLE NULL,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `endDate` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `sponsorships` ADD CONSTRAINT `sponsorships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
