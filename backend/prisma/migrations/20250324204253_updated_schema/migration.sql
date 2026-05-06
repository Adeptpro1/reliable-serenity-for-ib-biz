-- DropForeignKey
ALTER TABLE `contact_urls` DROP FOREIGN KEY `contact_urls_userId_fkey`;

-- DropIndex
DROP INDEX `contact_urls_userId_fkey` ON `contact_urls`;

-- AlterTable
ALTER TABLE `addresses` ADD COLUMN `address1` ENUM('Headquarters', 'Annex') NOT NULL DEFAULT 'Headquarters',
    ADD COLUMN `address2` ENUM('Headquarters', 'Annex') NOT NULL DEFAULT 'Annex';
