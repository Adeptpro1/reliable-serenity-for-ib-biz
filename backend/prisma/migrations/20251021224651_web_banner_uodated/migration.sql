/*
  Warnings:

  - You are about to drop the `bannersetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `bannersetting`;

-- CreateTable
CREATE TABLE `WebBannerSetting` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `text` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
