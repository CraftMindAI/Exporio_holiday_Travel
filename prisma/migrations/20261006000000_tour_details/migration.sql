-- AlterTable
ALTER TABLE `tours` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `destination_id` CHAR(36) NULL,
    ADD COLUMN `facilities` JSON NULL;

-- CreateIndex
CREATE INDEX `tours_destination_id_idx` ON `tours`(`destination_id`);

-- CreateIndex
CREATE UNIQUE INDEX `destinations_name_key` ON `destinations`(`name`);

-- AddForeignKey
ALTER TABLE `tours` ADD CONSTRAINT `tours_destination_id_fkey` FOREIGN KEY (`destination_id`) REFERENCES `destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

