/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `businesses` will be added. If there are existing duplicate values, this will fail.
  - Made the column `category` on table `businesses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `businesses` MODIFY `category` ENUM('AGRIBUSINESS', 'MANUFACTURING', 'RETAIL_WHOLESALE', 'TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'TOURISM_HOSPITALITY', 'REAL_ESTATE', 'TRANSPORT_LOGISTICS', 'FINANCIAL_SERVICES', 'ENERGY', 'MINING', 'CREATIVE_ENTERTAINMENT', 'PROFESSIONAL_SERVICES', 'ENVIRONMENTAL_SERVICES', 'SECURITY_SERVICES', 'TELECOMMUNICATIONS', 'MEDIA_PUBLISHING', 'AUTOMOTIVE', 'PERSONAL_SERVICES', 'HOUSEHOLD_SERVICES') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `businesses_name_key` ON `businesses`(`name`);
