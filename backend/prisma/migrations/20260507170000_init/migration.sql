-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `firebaseUid` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `lg` ENUM('I_DO_NOT_STAY_IN_OYO', 'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan_North', 'Ibadan_North_East', 'Ibadan_North_West', 'Ibadan_South_East', 'Ibadan_South_West', 'Ibarapa_Central', 'Ibarapa_East', 'Ibarapa_North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho_North', 'Ogbomosho_South', 'Ogo_Oluwa', 'Olorunsogo', 'Oluyole', 'Ona_Ara', 'Orelope', 'Ori_Ire', 'Oyo_East', 'Oyo_West', 'Saki_East', 'Saki_West', 'Surulere') NULL,
    `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki') NULL,
    `state` ENUM('OUTSIDE_NIGERIA', 'Abia', 'Adamawa', 'Akwa_Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross_River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara') NULL,
    `town` ENUM('Mokola', 'Bodija', 'Agodi', 'Iwo_Road', 'Dugbe', 'Apata', 'Sango', 'UI', 'Agbowo', 'Samonda', 'Ojoo', 'Alalubosa', 'Bashorun', 'Felele', 'Jericho', 'Oluyole', 'Challenge', 'Olorunsogo', 'Onireke', 'Eleyele', 'Eruwa', 'Kisi', 'Igboho', 'Igbeti', 'Awe', 'Ilora', 'Oja_ba', 'Beere', 'Foko', 'Labiran', 'OkeAdo', 'OkeBola', 'OkeOffa', 'OkePadi', 'Yemetu', 'Akobo', 'Egbeda', 'Olodo', 'Monatan', 'Olorunda', 'Orogun', 'Ologuneru', 'Adegbayi', 'Oje', 'Okeho', 'Lanlate', 'Lalupon', 'Fiditi', 'Igbo_Ora', 'Idere', 'Moniya', 'Akanran', 'Apatere', 'Adeoyo', 'Idi_Ayunre', 'Olanla', 'Olojuoro', 'Osekan', 'Podo', 'Apete', 'Ajibode', 'Sepeteri', 'Tede', 'Iwere_Ile', 'Ago_Are', 'Ilero', 'Akinyele', 'Alakia', 'Apomu', 'Jobele', 'Omi_Adio', 'Otu') NULL,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerificationToken` VARCHAR(191) NULL,
    `emailVerificationTokenExpiry` DATETIME(3) NULL,
    `passwordResetToken` TEXT NULL,
    `passwordResetTokenExpiry` DATETIME(3) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `agreedToPolicy` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_firebaseUid_key`(`firebaseUid`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByIp` VARCHAR(191) NULL,
    `replacedByTokenId` VARCHAR(191) NULL,

    INDEX `refresh_tokens_userId_idx`(`userId`),
    INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `businesses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('AGRIBUSINESS', 'MANUFACTURING', 'RETAIL_WHOLESALE', 'TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'TOURISM_HOSPITALITY', 'REAL_ESTATE', 'TRANSPORT_LOGISTICS', 'FINANCIAL_SERVICES', 'ENERGY', 'MINING', 'CREATIVE_ENTERTAINMENT', 'PROFESSIONAL_SERVICES', 'ENVIRONMENTAL_SERVICES', 'SECURITY_SERVICES', 'TELECOMMUNICATIONS', 'MEDIA_PUBLISHING', 'AUTOMOTIVE', 'PERSONAL_SERVICES', 'HOUSEHOLD_SERVICES') NOT NULL,
    `isMadeInOyo` BOOLEAN NOT NULL DEFAULT false,
    `phone` VARCHAR(191) NULL,
    `locationBoundary` JSON NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isBusinessOfTheWeek` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `businesses_name_key`(`name`),
    UNIQUE INDEX `businesses_slug_key`(`slug`),
    INDEX `businesses_name_idx`(`name`),
    INDEX `businesses_category_idx`(`category`),
    INDEX `businesses_isVerified_idx`(`isVerified`),
    INDEX `businesses_isMadeInOyo_idx`(`isMadeInOyo`),
    INDEX `businesses_userId_fkey`(`userId`),
    FULLTEXT INDEX `businesses_name_description_idx`(`name`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NULL DEFAULT 'Headquarters',
    `address2` VARCHAR(191) NULL DEFAULT 'Annex',
    `city` ENUM('Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki') NULL,
    `lg` ENUM('I_DO_NOT_STAY_IN_OYO', 'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan_North', 'Ibadan_North_East', 'Ibadan_North_West', 'Ibadan_South_East', 'Ibadan_South_West', 'Ibarapa_Central', 'Ibarapa_East', 'Ibarapa_North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho_North', 'Ogbomosho_South', 'Ogo_Oluwa', 'Olorunsogo', 'Oluyole', 'Ona_Ara', 'Orelope', 'Ori_Ire', 'Oyo_East', 'Oyo_West', 'Saki_East', 'Saki_West', 'Surulere') NULL,
    `town` ENUM('Mokola', 'Bodija', 'Agodi', 'Iwo_Road', 'Dugbe', 'Apata', 'Sango', 'UI', 'Agbowo', 'Samonda', 'Ojoo', 'Alalubosa', 'Bashorun', 'Felele', 'Jericho', 'Oluyole', 'Challenge', 'Olorunsogo', 'Onireke', 'Eleyele', 'Eruwa', 'Kisi', 'Igboho', 'Igbeti', 'Awe', 'Ilora', 'Oja_ba', 'Beere', 'Foko', 'Labiran', 'OkeAdo', 'OkeBola', 'OkeOffa', 'OkePadi', 'Yemetu', 'Akobo', 'Egbeda', 'Olodo', 'Monatan', 'Olorunda', 'Orogun', 'Ologuneru', 'Adegbayi', 'Oje', 'Okeho', 'Lanlate', 'Lalupon', 'Fiditi', 'Igbo_Ora', 'Idere', 'Moniya', 'Akanran', 'Apatere', 'Adeoyo', 'Idi_Ayunre', 'Olanla', 'Olojuoro', 'Osekan', 'Podo', 'Apete', 'Ajibode', 'Sepeteri', 'Tede', 'Iwere_Ile', 'Ago_Are', 'Ilero', 'Akinyele', 'Alakia', 'Apomu', 'Jobele', 'Omi_Adio', 'Otu') NULL,

    INDEX `addresses_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_images` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `isLogo` BOOLEAN NOT NULL DEFAULT false,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `business_images_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_videos` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `boosted` BOOLEAN NOT NULL DEFAULT false,
    `duration` INTEGER NOT NULL DEFAULT 60,
    `locationBoundary` JSON NULL,
    `isSponsored` BOOLEAN NOT NULL DEFAULT false,
    `sponsoredAdId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `business_videos_businessId_idx`(`businessId`),
    INDEX `business_videos_sponsoredAdId_idx`(`sponsoredAdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reviews_businessId_idx`(`businessId`),
    INDEX `reviews_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noticeboards` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `callToAction` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `boosted` BOOLEAN NOT NULL DEFAULT false,
    `boostExpiresAt` DATETIME(3) NULL,
    `locationBoundary` VARCHAR(191) NULL,
    `leadFields` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `noticeboards_businessId_idx`(`businessId`),
    FULLTEXT INDEX `noticeboards_title_content_idx`(`title`, `content`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `contact_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `noticeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `additionalData` JSON NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contact_submissions_noticeId_idx`(`noticeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sponsorships` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessIds` JSON NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `businessEmail` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `amount` DOUBLE NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sponsorships_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `heatmap_analytics` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `videoId` VARCHAR(191) NULL,
    `noticeId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,
    `pageViews` INTEGER NOT NULL DEFAULT 0,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `urlClicks` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `heatmap_analytics_businessId_idx`(`businessId`),
    INDEX `heatmap_analytics_videoId_idx`(`videoId`),
    INDEX `heatmap_analytics_noticeId_idx`(`noticeId`),
    INDEX `heatmap_analytics_productId_idx`(`productId`),
    INDEX `heatmap_analytics_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_urls` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` ENUM('INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'WEBSITE', 'WHATSAPP', 'PHONE', 'TELEGRAM', 'EMAIL') NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `contact_urls_userId_idx`(`userId`),
    INDEX `contact_urls_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `type` ENUM('WEB_BANNER', 'IN_APP_NOTIFICATION', 'EVENTS', 'SPONSOR') NOT NULL,
    `status` ENUM('AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'EXPIRED') NOT NULL DEFAULT 'AWAITING_APPROVAL',
    `title` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `autoApprove` BOOLEAN NOT NULL DEFAULT false,
    `impressions` INTEGER NOT NULL DEFAULT 0,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paymentId` VARCHAR(191) NULL,
    `approvedById` VARCHAR(191) NULL,

    INDEX `ads_businessId_idx`(`businessId`),
    INDEX `ads_type_idx`(`type`),
    INDEX `ads_status_idx`(`status`),
    INDEX `ads_startDate_idx`(`startDate`),
    INDEX `ads_endDate_idx`(`endDate`),
    INDEX `ads_approvedById_fkey`(`approvedById`),
    INDEX `ads_paymentId_fkey`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `top_listing_ads` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `toplistad` ENUM('BUSINESS_TOPLIST', 'NOTICE_TOPLIST', 'PRODUCT_TOPLIST') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paymentId` VARCHAR(191) NULL,

    INDEX `top_listing_ads_businessId_idx`(`businessId`),
    INDEX `top_listing_ads_startDate_idx`(`startDate`),
    INDEX `top_listing_ads_endDate_idx`(`endDate`),
    INDEX `top_listing_ads_paymentId_fkey`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `isMadeInOyo` BOOLEAN NOT NULL DEFAULT false,
    `stock` INTEGER NOT NULL DEFAULT 1,
    `discount` DOUBLE NULL DEFAULT 0,
    `deliveryOption` ENUM('PICKUP_ONLY', 'DELIVERY_ONLY', 'BOTH_OPTIONS') NOT NULL,
    `category` ENUM('ELECTRONICS', 'FASHION', 'HOME_GARDEN', 'BEAUTY_HEALTH', 'SPORTS_OUTDOOR', 'BOOKS_MEDIA', 'AUTOMOTIVE', 'FOOD_BEVERAGES', 'TOYS_GAMES', 'ART_CRAFTS', 'JEWELRY_ACCESSORIES', 'PET_SUPPLIES', 'OFFICE_SUPPLIES', 'MUSICAL_INSTRUMENTS', 'OTHER') NOT NULL,
    `contactPreference` ENUM('INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'WEBSITE', 'WHATSAPP', 'PHONE', 'TELEGRAM', 'EMAIL') NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `isBoosted` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `products_businessId_idx`(`businessId`),
    INDEX `products_category_idx`(`category`),
    INDEX `products_isMadeInOyo_idx`(`isMadeInOyo`),
    INDEX `products_isActive_idx`(`isActive`),
    FULLTEXT INDEX `products_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_images_productId_idx`(`productId`),
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
CREATE TABLE `business_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `natureOfBusiness` VARCHAR(191) NOT NULL,
    `currentAddress` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(191) NOT NULL,
    `certificationType` VARCHAR(191) NULL,
    `primaryContactName` VARCHAR(191) NULL,
    `primaryContactPhone` VARCHAR(191) NULL,
    `primaryContactEmail` VARCHAR(191) NULL,
    `secondaryContactName` VARCHAR(191) NULL,
    `secondaryContactPhone` VARCHAR(191) NULL,
    `secondaryContactEmail` VARCHAR(191) NULL,
    `cacCertificateUrl` VARCHAR(191) NOT NULL,
    `memoOfAssociationUrl` VARCHAR(191) NULL,
    `letterheadUrl` VARCHAR(191) NULL,
    `chequeUrl` VARCHAR(191) NULL,
    `paymentAmount` INTEGER NOT NULL DEFAULT 50000,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewerNotes` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,

    INDEX `business_verifications_businessId_idx`(`businessId`),
    INDEX `business_verifications_status_idx`(`status`),
    INDEX `business_verifications_paymentStatus_idx`(`paymentStatus`),
    INDEX `business_verifications_paymentId_fkey`(`paymentId`),
    INDEX `business_verifications_reviewedBy_fkey`(`reviewedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification', 'Wallet_Funding', 'Notice_Boost') NOT NULL,
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

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `mediaUrls` TEXT NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricings` (
    `id` VARCHAR(191) NOT NULL,
    `category` ENUM('AD_CATEGORY', 'TOP_LIST_CATEGORY', 'OTHER_ADS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `purpose` ENUM('Top_List_Biz', 'Top_List_Product', 'Sponsored_Video', 'Top_List_Notice', 'Biz_Verification', 'Sponsor', 'Web_Banner', 'Events', 'In_app_notification', 'Wallet_Funding', 'Notice_Boost') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `benefit` VARCHAR(191) NOT NULL DEFAULT 'Best for business awareness',
    `url` VARCHAR(191) NOT NULL DEFAULT 'https://debisi.ng/login',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sponsor_settings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `image` TEXT NOT NULL,
    `url` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `top_header_settings` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NULL,
    `link` TEXT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_banner_settings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `text` TEXT NULL,
    `image` TEXT NULL,
    `url` TEXT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `notice_images` ADD CONSTRAINT `notice_images_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_submissions` ADD CONSTRAINT `contact_submissions_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sponsorships` ADD CONSTRAINT `sponsorships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_noticeId_fkey` FOREIGN KEY (`noticeId`) REFERENCES `noticeboards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `heatmap_analytics` ADD CONSTRAINT `heatmap_analytics_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `business_videos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_urls` ADD CONSTRAINT `contact_urls_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ads` ADD CONSTRAINT `ads_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `business_verifications` ADD CONSTRAINT `business_verifications_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_verifications` ADD CONSTRAINT `business_verifications_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
