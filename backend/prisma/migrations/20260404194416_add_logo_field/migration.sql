-- AlterTable
ALTER TABLE `ads` MODIFY `type` ENUM('WEB_BANNER', 'IN_APP_NOTIFICATION', 'EVENTS', 'SPONSOR') NOT NULL;

-- AlterTable
ALTER TABLE `business_images` ADD COLUMN `isLogo` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `business_verifications` ADD COLUMN `certificationType` VARCHAR(191) NULL,
    ADD COLUMN `primaryContactEmail` VARCHAR(191) NULL,
    ADD COLUMN `primaryContactName` VARCHAR(191) NULL,
    ADD COLUMN `primaryContactPhone` VARCHAR(191) NULL,
    ADD COLUMN `secondaryContactEmail` VARCHAR(191) NULL,
    ADD COLUMN `secondaryContactName` VARCHAR(191) NULL,
    ADD COLUMN `secondaryContactPhone` VARCHAR(191) NULL,
    MODIFY `memoOfAssociationUrl` VARCHAR(191) NULL,
    MODIFY `letterheadUrl` VARCHAR(191) NULL,
    MODIFY `chequeUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `heatmap_analytics` ADD COLUMN `shares` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `therapy_session_requests` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('PENDING', 'CONTACTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
