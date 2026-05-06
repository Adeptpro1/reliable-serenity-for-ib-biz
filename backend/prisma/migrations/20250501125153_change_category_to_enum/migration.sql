/*
  Warnings:

  - You are about to alter the column `address1` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to alter the column `address2` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(191)`.
  - You are about to drop the column `categoryId` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the `business_categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `businesses` DROP FOREIGN KEY `businesses_categoryId_fkey`;

-- DropIndex
DROP INDEX `businesses_categoryId_fkey` ON `businesses`;

-- AlterTable
ALTER TABLE `addresses` MODIFY `address1` VARCHAR(191) NULL DEFAULT 'Headquarters',
    MODIFY `address2` VARCHAR(191) NULL DEFAULT 'Annex';

-- AlterTable
ALTER TABLE `businesses` DROP COLUMN `categoryId`,
    ADD COLUMN `category` ENUM('AGRIBUSINESS', 'MANUFACTURING', 'RETAIL_WHOLESALE', 'TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'TOURISM_HOSPITALITY', 'REAL_ESTATE', 'TRANSPORT_LOGISTICS', 'FINANCIAL_SERVICES', 'ENERGY', 'MINING', 'CREATIVE_ENTERTAINMENT', 'PROFESSIONAL_SERVICES', 'ENVIRONMENTAL_SERVICES', 'SECURITY_SERVICES', 'TELECOMMUNICATIONS', 'MEDIA_PUBLISHING', 'AUTOMOTIVE', 'PERSONAL_SERVICES', 'HOUSEHOLD_SERVICES') NULL;

-- DropTable
DROP TABLE `business_categories`;
