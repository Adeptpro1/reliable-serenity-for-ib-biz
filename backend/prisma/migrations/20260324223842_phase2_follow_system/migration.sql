-- AlterTable
ALTER TABLE `contact_submissions` ADD COLUMN `additionalData` JSON NULL;

-- AlterTable
ALTER TABLE `noticeboards` ADD COLUMN `leadFields` JSON NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification', 'Wallet_Funding', 'Notice_Boost') NOT NULL;

-- AlterTable
ALTER TABLE `pricing` MODIFY `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification', 'Wallet_Funding', 'Notice_Boost') NOT NULL;

-- CreateTable
CREATE TABLE `notice_images` (
    `id` VARCHAR(191) NOT NULL,
    `noticeId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notice_images_noticeId_idx`(`noticeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_userId_key`(`userId`),
    INDEX `wallets_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` ENUM('FUNDING', 'DEDUCTION') NOT NULL,
    `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification', 'Wallet_Funding', 'Notice_Boost') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `wallet_transactions_walletId_idx`(`walletId`),
    INDEX `wallet_transactions_businessId_idx`(`businessId`),
    INDEX `wallet_transactions_type_idx`(`type`),
    INDEX `wallet_transactions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follows` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `follows_businessId_idx`(`businessId`),
    INDEX `follows_userId_idx`(`userId`),
    UNIQUE INDEX `follows_userId_businessId_key`(`userId`, `businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notice_images` ADD CONSTRAINT `notice_images_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
