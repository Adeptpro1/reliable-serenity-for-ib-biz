/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `businessvideo` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `referredById` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `discountoffer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `joblisting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `referral` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `discountoffer` DROP FOREIGN KEY `DiscountOffer_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `joblisting` DROP FOREIGN KEY `JobListing_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_receiverId_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `referral` DROP FOREIGN KEY `Referral_referredUserId_fkey`;

-- DropForeignKey
ALTER TABLE `referral` DROP FOREIGN KEY `Referral_referrerId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_referredById_fkey`;

-- DropIndex
DROP INDEX `User_referralCode_key` ON `user`;

-- DropIndex
DROP INDEX `User_referredById_fkey` ON `user`;

-- AlterTable
ALTER TABLE `businessvideo` DROP COLUMN `videoUrl`,
    ADD COLUMN `paid` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `ratings` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `referralCode`,
    DROP COLUMN `referredById`;

-- DropTable
DROP TABLE `discountoffer`;

-- DropTable
DROP TABLE `joblisting`;

-- DropTable
DROP TABLE `message`;

-- DropTable
DROP TABLE `referral`;

-- CreateTable
CREATE TABLE `NoticeBoard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `offerType` ENUM('NOTICE', 'EVENT') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NoticeBoard` ADD CONSTRAINT `NoticeBoard_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
