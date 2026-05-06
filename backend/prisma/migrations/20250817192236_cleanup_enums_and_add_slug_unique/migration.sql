/*
  Warnings:

  - You are about to alter the column `town` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(9))`.
  - The values [Eruwa,Igbo_Ora,Kisi,Igboho,Lalupon,Moniya,Igbeti,Awe,Ilora,Okeho] on the enum `addresses_city` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `ads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adType` on the `ads` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `ads` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `ads` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `ads` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `ads` table. All the data in the column will be lost.
  - The primary key for the `business_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `business_verifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The values [UNDER_REVIEW] on the enum `business_verifications_status` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `business_videos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `businesses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `contact_submissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `message` on the `contact_submissions` table. All the data in the column will be lost.
  - The primary key for the `contact_urls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The values [TWITTER,OTHER] on the enum `products_contactPreference` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `heatmap_analytics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user` on the `heatmap_analytics` table. All the data in the column will be lost.
  - The primary key for the `noticeboards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `businessId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `notifications` table. All the data in the column will be lost.
  - The primary key for the `product_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `top_listing_ads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The values [Eruwa,Igbo_Ora,Kisi,Igboho,Lalupon,Moniya,Igbeti,Awe,Ilora,Okeho] on the enum `addresses_city` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `sponsors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `businesses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `businesses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `ads` DROP FOREIGN KEY `ads_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `business_images` DROP FOREIGN KEY `business_images_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `business_verifications` DROP FOREIGN KEY `business_verifications_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `business_verifications` DROP FOREIGN KEY `business_verifications_reviewedBy_fkey`;

-- DropForeignKey
ALTER TABLE `business_videos` DROP FOREIGN KEY `business_videos_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `businesses` DROP FOREIGN KEY `businesses_userId_fkey`;

-- DropForeignKey
ALTER TABLE `contact_submissions` DROP FOREIGN KEY `contact_submissions_noticeId_fkey`;

-- DropForeignKey
ALTER TABLE `contact_urls` DROP FOREIGN KEY `contact_urls_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmap_analytics` DROP FOREIGN KEY `heatmap_analytics_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmap_analytics` DROP FOREIGN KEY `heatmap_analytics_noticeId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmap_analytics` DROP FOREIGN KEY `heatmap_analytics_videoId_fkey`;

-- DropForeignKey
ALTER TABLE `noticeboards` DROP FOREIGN KEY `noticeboards_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `product_images` DROP FOREIGN KEY `product_images_productId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_userId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsors` DROP FOREIGN KEY `sponsors_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsors` DROP FOREIGN KEY `sponsors_userId_fkey`;

-- DropForeignKey
ALTER TABLE `top_listing_ads` DROP FOREIGN KEY `top_listing_ads_businessId_fkey`;

-- DropIndex
DROP INDEX `business_verifications_reviewedBy_fkey` ON `business_verifications`;

-- DropIndex
DROP INDEX `businesses_userId_fkey` ON `businesses`;

-- DropIndex
DROP INDEX `notifications_businessId_fkey` ON `notifications`;

-- AlterTable
ALTER TABLE `addresses` MODIFY `businessId` VARCHAR(191) NOT NULL,
    MODIFY `town` ENUM('Mokola', 'Bodija', 'Agodi', 'Iwo_Road', 'Dugbe', 'Apata', 'Sango', 'UI', 'Agbowo', 'Samonda', 'Ojoo', 'Alalubosa', 'Bashorun', 'Felele', 'Jericho', 'Oluyole', 'Challenge', 'Olorunsogo', 'Onireke', 'Eleyele', 'Eruwa', 'Kisi', 'Igboho', 'Igbeti', 'Awe', 'Ilora', 'Oja_ba', 'Beere', 'Foko', 'Labiran', 'OkeAdo', 'OkeBola', 'OkeOffa', 'OkePadi', 'Yemetu', 'Akobo', 'Egbeda', 'Olodo', 'Monatan', 'Olorunda', 'Orogun', 'Ologuneru', 'Adegbayi', 'Oje', 'Okeho', 'Lanlate', 'Lalupon', 'Fiditi', 'Igbo_Ora', 'Idere', 'Moniya', 'Akanran', 'Apatere', 'Adeoyo', 'Idi_Ayunre', 'Olanla', 'Olojuoro', 'Osekan', 'Podo', 'Apete', 'Ajibode', 'Sepeteri', 'Tede', 'Iwere_Ile', 'Ago_Are', 'Ilero', 'Akinyele', 'Alakia', 'Apomu', 'Jobele', 'Omi_Adio', 'Otu') NULL,
    MODIFY `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki') NULL;

-- AlterTable
ALTER TABLE `ads` DROP PRIMARY KEY,
    DROP COLUMN `adType`,
    DROP COLUMN `companyName`,
    DROP COLUMN `details`,
    DROP COLUMN `email`,
    DROP COLUMN `fullName`,
    ADD COLUMN `approvedById` VARCHAR(191) NULL,
    ADD COLUMN `autoApprove` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `clicks` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `impressions` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'EXPIRED') NOT NULL DEFAULT 'AWAITING_APPROVAL',
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('WEB_BANNER', 'SPONSOR', 'SPONSORED_NOTICE', 'SPONSORED_VIDEO') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    MODIFY `image` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `business_images` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `business_verifications` DROP PRIMARY KEY,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    MODIFY `reviewedBy` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `business_videos` DROP PRIMARY KEY,
    ADD COLUMN `isSponsored` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sponsoredAdId` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `businesses` DROP PRIMARY KEY,
    ADD COLUMN `locationBoundary` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `contact_submissions` DROP PRIMARY KEY,
    DROP COLUMN `message`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `noticeId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `contact_urls` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `businessId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'WEBSITE', 'WHATSAPP', 'PHONE', 'TELEGRAM', 'EMAIL') NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `heatmap_analytics` DROP PRIMARY KEY,
    DROP COLUMN `user`,
    ADD COLUMN `productId` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NULL,
    MODIFY `videoId` VARCHAR(191) NULL,
    MODIFY `noticeId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `noticeboards` DROP PRIMARY KEY,
    ADD COLUMN `boostExpiresAt` DATETIME(3) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notifications` DROP PRIMARY KEY,
    DROP COLUMN `businessId`,
    DROP COLUMN `read`,
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `product_images` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `productId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    ADD COLUMN `likes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `shares` INTEGER NOT NULL DEFAULT 0,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    MODIFY `contactPreference` ENUM('INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'WEBSITE', 'WHATSAPP', 'PHONE', 'TELEGRAM', 'EMAIL') NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `reviews` MODIFY `businessId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `rating` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `top_listing_ads` DROP PRIMARY KEY,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `businessId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    ADD COLUMN `town` ENUM('Mokola', 'Bodija', 'Agodi', 'Iwo_Road', 'Dugbe', 'Apata', 'Sango', 'UI', 'Agbowo', 'Samonda', 'Ojoo', 'Alalubosa', 'Bashorun', 'Felele', 'Jericho', 'Oluyole', 'Challenge', 'Olorunsogo', 'Onireke', 'Eleyele', 'Eruwa', 'Kisi', 'Igboho', 'Igbeti', 'Awe', 'Ilora', 'Oja_ba', 'Beere', 'Foko', 'Labiran', 'OkeAdo', 'OkeBola', 'OkeOffa', 'OkePadi', 'Yemetu', 'Akobo', 'Egbeda', 'Olodo', 'Monatan', 'Olorunda', 'Orogun', 'Ologuneru', 'Adegbayi', 'Oje', 'Okeho', 'Lanlate', 'Lalupon', 'Fiditi', 'Igbo_Ora', 'Idere', 'Moniya', 'Akanran', 'Apatere', 'Adeoyo', 'Idi_Ayunre', 'Olanla', 'Olojuoro', 'Osekan', 'Podo', 'Apete', 'Ajibode', 'Sepeteri', 'Tede', 'Iwere_Ile', 'Ago_Are', 'Ilero', 'Akinyele', 'Alakia', 'Apomu', 'Jobele', 'Omi_Adio', 'Otu') NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki') NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `sponsors`;

-- CreateTable
CREATE TABLE `slug_history` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `slug_history_businessId_idx`(`businessId`),
    INDEX `slug_history_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sponsorships` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `benefits` JSON NULL,
    `businessId` VARCHAR(191) NULL,

    INDEX `sponsorships_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_reports_productId_idx`(`productId`),
    INDEX `product_reports_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Sponsored_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner') NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,
    `adId` VARCHAR(191) NULL,
    `noticeId` VARCHAR(191) NULL,
    `verificationId` VARCHAR(191) NULL,
    `sponsorshipId` VARCHAR(191) NULL,
    `topListingAdId` VARCHAR(191) NULL,

    UNIQUE INDEX `payments_reference_key`(`reference`),
    INDEX `payments_userId_idx`(`userId`),
    INDEX `payments_businessId_idx`(`businessId`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_purpose_idx`(`purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ads_type_idx` ON `ads`(`type`);

-- CreateIndex
CREATE INDEX `ads_status_idx` ON `ads`(`status`);

-- CreateIndex
CREATE INDEX `ads_startDate_idx` ON `ads`(`startDate`);

-- CreateIndex
CREATE INDEX `ads_endDate_idx` ON `ads`(`endDate`);

-- CreateIndex
CREATE INDEX `business_videos_sponsoredAdId_idx` ON `business_videos`(`sponsoredAdId`);

-- CreateIndex
CREATE UNIQUE INDEX `businesses_slug_key` ON `businesses`(`slug`);

-- CreateIndex
CREATE INDEX `businesses_category_idx` ON `businesses`(`category`);

-- CreateIndex
CREATE INDEX `businesses_isVerified_idx` ON `businesses`(`isVerified`);

-- CreateIndex
CREATE INDEX `businesses_isMadeInOyo_idx` ON `businesses`(`isMadeInOyo`);

-- CreateIndex
CREATE FULLTEXT INDEX `businesses_name_description_idx` ON `businesses`(`name`, `description`);

-- CreateIndex
CREATE INDEX `contact_urls_userId_idx` ON `contact_urls`(`userId`);

-- CreateIndex
CREATE INDEX `heatmap_analytics_productId_idx` ON `heatmap_analytics`(`productId`);

-- CreateIndex
CREATE INDEX `heatmap_analytics_userId_idx` ON `heatmap_analytics`(`userId`);

-- CreateIndex
CREATE FULLTEXT INDEX `noticeboards_title_content_idx` ON `noticeboards`(`title`, `content`);

-- CreateIndex
CREATE FULLTEXT INDEX `products_title_description_idx` ON `products`(`title`, `description`);

-- CreateIndex
CREATE INDEX `top_listing_ads_startDate_idx` ON `top_listing_ads`(`startDate`);

-- CreateIndex
CREATE INDEX `top_listing_ads_endDate_idx` ON `top_listing_ads`(`endDate`);

-- AddForeignKey
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `slug_history` ADD CONSTRAINT `slug_history_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_images` ADD CONSTRAINT `business_images_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_videos` ADD CONSTRAINT `business_videos_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `noticeboards` ADD CONSTRAINT `noticeboards_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_submissions` ADD CONSTRAINT `contact_submissions_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sponsorships` ADD CONSTRAINT `sponsorships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `business_videos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_urls` ADD CONSTRAINT `contact_urls_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `top_listing_ads` ADD CONSTRAINT `top_listing_ads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `top_listing_ads` ADD CONSTRAINT `top_listing_ads_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_reports` ADD CONSTRAINT `product_reports_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_reports` ADD CONSTRAINT `product_reports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_verifications` ADD CONSTRAINT `business_verifications_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_verifications` ADD CONSTRAINT `business_verifications_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_verifications` ADD CONSTRAINT `business_verifications_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `addresses` RENAME INDEX `addresses_businessId_fkey` TO `addresses_businessId_idx`;

-- RenameIndex
ALTER TABLE `ads` RENAME INDEX `ads_businessId_fkey` TO `ads_businessId_idx`;

-- RenameIndex
ALTER TABLE `business_images` RENAME INDEX `business_images_businessId_fkey` TO `business_images_businessId_idx`;

-- RenameIndex
ALTER TABLE `business_videos` RENAME INDEX `business_videos_businessId_fkey` TO `business_videos_businessId_idx`;

-- RenameIndex
ALTER TABLE `contact_urls` RENAME INDEX `contact_urls_businessId_fkey` TO `contact_urls_businessId_idx`;

-- RenameIndex
ALTER TABLE `noticeboards` RENAME INDEX `noticeboards_businessId_fkey` TO `noticeboards_businessId_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_userId_fkey` TO `notifications_userId_idx`;

-- RenameIndex
ALTER TABLE `product_images` RENAME INDEX `product_images_productId_fkey` TO `product_images_productId_idx`;

-- RenameIndex
ALTER TABLE `reviews` RENAME INDEX `reviews_businessId_fkey` TO `reviews_businessId_idx`;

-- RenameIndex
ALTER TABLE `reviews` RENAME INDEX `reviews_userId_fkey` TO `reviews_userId_idx`;

-- RenameIndex
ALTER TABLE `top_listing_ads` RENAME INDEX `top_listing_ads_businessId_fkey` TO `top_listing_ads_businessId_idx`;
