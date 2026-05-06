/*
  Warnings:

  - You are about to drop the `ad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `businesscategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `businessimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `businessvideo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contacturl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `heatmapanalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `noticeboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sponsor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `toplistingad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ad` DROP FOREIGN KEY `Ad_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `business` DROP FOREIGN KEY `Business_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `business` DROP FOREIGN KEY `Business_userId_fkey`;

-- DropForeignKey
ALTER TABLE `businessimage` DROP FOREIGN KEY `BusinessImage_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `businessvideo` DROP FOREIGN KEY `BusinessVideo_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `contacturl` DROP FOREIGN KEY `ContactUrl_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `contacturl` DROP FOREIGN KEY `ContactUrl_userId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmapanalytics` DROP FOREIGN KEY `HeatmapAnalytics_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmapanalytics` DROP FOREIGN KEY `HeatmapAnalytics_noticeId_fkey`;

-- DropForeignKey
ALTER TABLE `heatmapanalytics` DROP FOREIGN KEY `HeatmapAnalytics_videoId_fkey`;

-- DropForeignKey
ALTER TABLE `noticeboard` DROP FOREIGN KEY `Noticeboard_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsor` DROP FOREIGN KEY `Sponsor_businessId_fkey`;

-- DropForeignKey
ALTER TABLE `sponsor` DROP FOREIGN KEY `Sponsor_userId_fkey`;

-- DropForeignKey
ALTER TABLE `toplistingad` DROP FOREIGN KEY `TopListingAd_businessId_fkey`;

-- DropTable
DROP TABLE `ad`;

-- DropTable
DROP TABLE `address`;

-- DropTable
DROP TABLE `business`;

-- DropTable
DROP TABLE `businesscategory`;

-- DropTable
DROP TABLE `businessimage`;

-- DropTable
DROP TABLE `businessvideo`;

-- DropTable
DROP TABLE `contacturl`;

-- DropTable
DROP TABLE `heatmapanalytics`;

-- DropTable
DROP TABLE `noticeboard`;

-- DropTable
DROP TABLE `notification`;

-- DropTable
DROP TABLE `review`;

-- DropTable
DROP TABLE `sponsor`;

-- DropTable
DROP TABLE `toplistingad`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `lg` ENUM('I_DO_NOT_STAY_IN_OYO', 'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan_North', 'Ibadan_North_East', 'Ibadan_North_West', 'Ibadan_South_East', 'Ibadan_South_West', 'Ibarapa_Central', 'Ibarapa_East', 'Ibarapa_North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho_North', 'Ogbomosho_South', 'Ogo_Oluwa', 'Olorunsogo', 'Oluyole', 'Ona_Ara', 'Orelope', 'Ori_Ire', 'Oyo_East', 'Oyo_West', 'Saki_East', 'Saki_West', 'Surulere') NULL,
    `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki', 'Eruwa', 'Igbo_Ora', 'Kisi', 'Igboho', 'Lalupon', 'Moniya', 'Igbeti', 'Awe', 'Ilora', 'Okeho') NULL,
    `state` ENUM('OUTSIDE_NIGERIA', 'Abia', 'Adamawa', 'Akwa_Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross_River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara') NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `agreedToPolicy` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `businesses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `isMadeInOyo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `businesses_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `business_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `town` VARCHAR(191) NOT NULL,
    `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki', 'Eruwa', 'Igbo_Ora', 'Kisi', 'Igboho', 'Lalupon', 'Moniya', 'Igbeti', 'Awe', 'Ilora', 'Okeho') NULL,
    `lg` ENUM('I_DO_NOT_STAY_IN_OYO', 'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan_North', 'Ibadan_North_East', 'Ibadan_North_West', 'Ibadan_South_East', 'Ibadan_South_West', 'Ibarapa_Central', 'Ibarapa_East', 'Ibarapa_North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho_North', 'Ogbomosho_South', 'Ogo_Oluwa', 'Olorunsogo', 'Oluyole', 'Ona_Ara', 'Orelope', 'Ori_Ire', 'Oyo_East', 'Oyo_West', 'Saki_East', 'Saki_West', 'Surulere') NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_videos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `boosted` BOOLEAN NOT NULL DEFAULT false,
    `locationBoundary` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noticeboards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `callToAction` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `boosted` BOOLEAN NOT NULL DEFAULT false,
    `locationBoundary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sponsors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `top_listing_ads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessId` INTEGER NULL,
    `content` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `heatmap_analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NULL,
    `videoId` INTEGER NULL,
    `noticeId` INTEGER NULL,
    `pageViews` INTEGER NOT NULL DEFAULT 0,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `urlClicks` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `heatmap_analytics_businessId_idx`(`businessId`),
    INDEX `heatmap_analytics_videoId_idx`(`videoId`),
    INDEX `heatmap_analytics_noticeId_idx`(`noticeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_urls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `businessId` INTEGER NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `adType` ENUM('WEB_BANNER', 'EMAIL_MARKETING', 'IN_APP_NOTIFICATION', 'SMS_CAMPAIGN', 'SPONSORED_NOTICE', 'TOP_LISTING', 'SPONSORED_VIDEO') NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `business_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `sponsors` ADD CONSTRAINT `sponsors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sponsors` ADD CONSTRAINT `sponsors_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `top_listing_ads` ADD CONSTRAINT `top_listing_ads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `business_videos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_urls` ADD CONSTRAINT `contact_urls_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_urls` ADD CONSTRAINT `contact_urls_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
