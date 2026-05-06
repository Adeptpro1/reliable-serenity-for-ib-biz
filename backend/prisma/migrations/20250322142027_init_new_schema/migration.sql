/*
  Warnings:

  - You are about to drop the column `createdAt` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `socialMedia` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `businesscategory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `businessvideo` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `businessvideo` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `businessvideo` table. All the data in the column will be lost.
  - You are about to drop the column `clicks` on the `heatmapanalytics` table. All the data in the column will be lost.
  - You are about to drop the column `inquiries` on the `heatmapanalytics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `heatmapanalytics` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `heatmapanalytics` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `noticeboard` table. All the data in the column will be lost.
  - You are about to drop the column `offerType` on the `noticeboard` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `noticeboard` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `noticeboard` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(0))`.
  - You are about to drop the `airecommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `businessaddress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Noticeboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `airecommendation` DROP FOREIGN KEY `AIRecommendation_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `airecommendation` DROP FOREIGN KEY `AIRecommendation_userId_fkey`;

-- DropForeignKey
ALTER TABLE `businessaddress` DROP FOREIGN KEY `BusinessAddress_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmapanalytics` DROP FOREIGN KEY `HeatmapAnalytics_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `noticeboard` DROP FOREIGN KEY `NoticeBoard_businessId_fkey`;

-- DropIndex
DROP INDEX `HeatmapAnalytics_businessId_key` ON `heatmapanalytics`;

-- AlterTable
ALTER TABLE `business` DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`,
    DROP COLUMN `qrCode`,
    DROP COLUMN `socialMedia`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `verified`,
    DROP COLUMN `website`,
    DROP COLUMN `whatsapp`,
    ADD COLUMN `isMadeInOyo` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `businesscategory` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `businessvideo` DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `paid`,
    ADD COLUMN `boostCard` VARCHAR(191) NULL,
    ADD COLUMN `boostRate` DOUBLE NULL,
    ADD COLUMN `boosted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `downloads` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `likes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `locationBoundary` VARCHAR(191) NULL,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `heatmapanalytics` DROP COLUMN `clicks`,
    DROP COLUMN `inquiries`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `views`,
    ADD COLUMN `downloads` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `likes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `noticeId` INTEGER NULL,
    ADD COLUMN `pageViews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `urlClicks` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `videoId` INTEGER NULL,
    MODIFY `businessId` INTEGER NULL;

-- AlterTable
ALTER TABLE `noticeboard` DROP COLUMN `description`,
    DROP COLUMN `offerType`,
    DROP COLUMN `paid`,
    DROP COLUMN `title`,
    ADD COLUMN `boosted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `callToAction` VARCHAR(191) NULL,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `likes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `link` VARCHAR(191) NULL,
    ADD COLUMN `shares` INTEGER NOT NULL DEFAULT 0,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `endDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `createdAt`,
    DROP COLUMN `isRead`,
    DROP COLUMN `message`,
    DROP COLUMN `type`,
    ADD COLUMN `clicks` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `comment`,
    DROP COLUMN `ratings`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `name`,
    DROP COLUMN `passwordHash`,
    DROP COLUMN `phone`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `agreedToPolicy` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lg` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `airecommendation`;

-- DropTable
DROP TABLE `businessaddress`;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `town` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `lg` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactUrl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `businessId` INTEGER NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `adType` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `HeatmapAnalytics_businessId_idx` ON `HeatmapAnalytics`(`businessId`);

-- CreateIndex
CREATE INDEX `HeatmapAnalytics_videoId_idx` ON `HeatmapAnalytics`(`videoId`);

-- CreateIndex
CREATE INDEX `HeatmapAnalytics_noticeId_idx` ON `HeatmapAnalytics`(`noticeId`);

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Noticeboard` ADD CONSTRAINT `Noticeboard_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HeatmapAnalytics` ADD CONSTRAINT `HeatmapAnalytics_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HeatmapAnalytics` ADD CONSTRAINT `HeatmapAnalytics_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `BusinessVideo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HeatmapAnalytics` ADD CONSTRAINT `HeatmapAnalytics_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `Noticeboard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactUrl` ADD CONSTRAINT `ContactUrl_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactUrl` ADD CONSTRAINT `ContactUrl_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ad` ADD CONSTRAINT `Ad_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
