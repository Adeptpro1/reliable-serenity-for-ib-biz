-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `isMadeInOyo` BOOLEAN NOT NULL DEFAULT false,
    `stock` INTEGER NOT NULL DEFAULT 1,
    `discount` DOUBLE NULL DEFAULT 0,
    `deliveryOption` ENUM('PICKUP_ONLY', 'DELIVERY_ONLY', 'BOTH_OPTIONS') NOT NULL,
    `category` ENUM('ELECTRONICS', 'FASHION', 'HOME_GARDEN', 'BEAUTY_HEALTH', 'SPORTS_OUTDOOR', 'BOOKS_MEDIA', 'AUTOMOTIVE', 'FOOD_BEVERAGES', 'TOYS_GAMES', 'ART_CRAFTS', 'JEWELRY_ACCESSORIES', 'PET_SUPPLIES', 'OFFICE_SUPPLIES', 'MUSICAL_INSTRUMENTS', 'OTHER') NOT NULL,
    `contactPreference` ENUM('PHONE', 'WHATSAPP', 'EMAIL', 'INSTAGRAM', 'FACEBOOK', 'TELEGRAM', 'WEBSITE') NOT NULL,
    `isBoosted` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `products_businessId_idx`(`businessId`),
    INDEX `products_category_idx`(`category`),
    INDEX `products_isMadeInOyo_idx`(`isMadeInOyo`),
    INDEX `products_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
