-- AlterTable
ALTER TABLE `users` ADD COLUMN `employee_code` VARCHAR(20) NULL,
    ADD COLUMN `location` VARCHAR(150) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_employee_code_key` ON `users`(`employee_code`);

