/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `title` to the `noticeboards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `isPrimary`;

-- AlterTable
ALTER TABLE `businesses` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `heatmap_analytics` ADD COLUMN `user` INTEGER NULL;

-- AlterTable
ALTER TABLE `noticeboards` ADD COLUMN `title` VARCHAR(191) NOT NULL;
