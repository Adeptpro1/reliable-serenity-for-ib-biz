/*
  Warnings:

  - You are about to alter the column `locationBoundary` on the `business_videos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `type` on the `contact_urls` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `business_videos` ADD COLUMN `duration` INTEGER NOT NULL DEFAULT 60,
    MODIFY `locationBoundary` JSON NULL;

-- AlterTable
ALTER TABLE `contact_urls` MODIFY `type` ENUM('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'WEBSITE', 'WHATSAPP', 'PHONE', 'TELEGRAM', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `top_listing_ads` ADD COLUMN `rank` ENUM('Silver', 'Gold', 'Platinum') NULL;
