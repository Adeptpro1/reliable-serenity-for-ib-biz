/*
  Warnings:

  - The values [SPONSOR,SPONSORED_NOTICE,SPONSORED_VIDEO] on the enum `ads_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [Sponsored_Notice] on the enum `Pricing_purpose` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rank` on the `top_listing_ads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ads` MODIFY `type` ENUM('WEB_BANNER', 'IN_APP_NOTIFICATION', 'EVENTS') NOT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification') NOT NULL;

-- AlterTable
ALTER TABLE `top_listing_ads` DROP COLUMN `rank`,
    ADD COLUMN `toplistad` ENUM('BUSINESS_TOPLIST', 'NOTICE_TOPLIST', 'PRODUCT_TOPLIST') NULL;

-- CreateTable
CREATE TABLE `Pricing` (
    `id` VARCHAR(191) NOT NULL,
    `category` ENUM('AD_CATEGORY', 'TOP_LIST_CATEGORY', 'OTHER_ADS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
