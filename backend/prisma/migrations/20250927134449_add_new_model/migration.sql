/*
  Warnings:

  - Made the column `tokenHash` on table `refresh_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `tokenHash` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `topHeaderText` VARCHAR(191) NULL,
    `topHeaderLink` VARCHAR(191) NULL,
    `showTopHeader` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
