-- Customer (client) accounts are removed: only admins and employees can sign in
DELETE FROM `users` WHERE `role` = 'client';

-- DropForeignKey
ALTER TABLE `email_tokens` DROP FOREIGN KEY `email_tokens_user_id_fkey`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `email_verified_at`,
    MODIFY `role` ENUM('admin', 'employee') NOT NULL DEFAULT 'employee';

-- DropTable
DROP TABLE `email_tokens`;

