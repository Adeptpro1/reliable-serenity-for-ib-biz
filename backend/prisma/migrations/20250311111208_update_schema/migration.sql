/*
  Warnings:

  - You are about to drop the column `country` on the `businessaddress` table. All the data in the column will be lost.
  - Added the required column `videoUrl` to the `businessvideo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `businessaddress` DROP COLUMN `country`,
    ADD COLUMN `lg` VARCHAR(191) NULL,
    ADD COLUMN `town` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `businessvideo` ADD COLUMN `videoUrl` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `businessId` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Notification_businessId_fkey` ON `notification`(`businessId`);

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
