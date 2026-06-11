/*
  Warnings:

  - You are about to drop the column `statut` on the `system_prompts` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tier]` on the table `system_prompts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tier` to the `system_prompts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `system_prompts_statut_key` ON `system_prompts`;

-- AlterTable
ALTER TABLE `message_logs` ADD COLUMN `actionStatus` VARCHAR(191) NULL,
    ADD COLUMN `intent` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `system_prompts` DROP COLUMN `statut`,
    ADD COLUMN `tier` ENUM('PROSPECT', 'VERIFIED', 'PREMIUM', 'ADMIN') NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `statut`,
    ADD COLUMN `tier` ENUM('PROSPECT', 'VERIFIED', 'PREMIUM', 'ADMIN') NOT NULL DEFAULT 'PROSPECT';

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `whatsappId` VARCHAR(191) NOT NULL,
    `currentState` ENUM('IDLE', 'AWAITING_KYC_DOC', 'KYC_IN_PROGRESS', 'AWAITING_PIN', 'AWAITING_AMOUNT', 'CONFIRM_TRANSACTION') NOT NULL DEFAULT 'IDLE',
    `contextData` JSON NULL,
    `lastUpdated` DATETIME(3) NOT NULL,
    `kycExternalId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `lastInteractionAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_whatsappId_key`(`whatsappId`),
    UNIQUE INDEX `sessions_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_logs_archive` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `intent` VARCHAR(191) NULL,
    `actionStatus` VARCHAR(191) NULL,
    `archivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `system_prompts_tier_key` ON `system_prompts`(`tier`);

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_logs` ADD CONSTRAINT `message_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
