-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `role` ENUM('client', 'admin') NOT NULL DEFAULT 'client',
    `password` VARCHAR(255) NOT NULL,
    `email_verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_tokens` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('verify_email') NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_tokens_token_hash_key`(`token_hash`),
    INDEX `email_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tours` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'domestic',
    `price` DECIMAL(10, 2) NOT NULL,
    `original_price` DECIMAL(10, 2) NULL,
    `duration_nights` INTEGER NOT NULL,
    `duration_days` INTEGER NOT NULL,
    `rating` DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `image_url` TEXT NOT NULL,
    `highlights` JSON NULL,
    `inclusions` JSON NULL,
    `exclusions` JSON NULL,
    `itinerary` JSON NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_trending` BOOLEAN NOT NULL DEFAULT false,
    `subscribers_notified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tours_slug_key`(`slug`),
    INDEX `tours_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_places_visit` (
    `id` CHAR(36) NOT NULL,
    `tour_id` CHAR(36) NOT NULL,
    `place_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `day_number` INTEGER NULL,
    `image_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tour_places_visit_tour_id_idx`(`tour_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `destinations` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `image_url` TEXT NOT NULL,
    `package_count` INTEGER NOT NULL DEFAULT 10,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `destinations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogs` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `image_url` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `author` VARCHAR(150) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blogs_slug_key`(`slug`),
    INDEX `blogs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL DEFAULT '',
    `phone` VARCHAR(30) NOT NULL,
    `tour_id` CHAR(36) NULL,
    `tour_title` VARCHAR(255) NULL,
    `travel_date` DATE NULL,
    `guests_count` INTEGER NOT NULL DEFAULT 2,
    `message` TEXT NULL,
    `status` ENUM('pending', 'contacted', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inquiries_created_at_idx`(`created_at`),
    INDEX `inquiries_tour_id_idx`(`tour_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'unread',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `name` VARCHAR(150) NULL,
    `phone` VARCHAR(30) NULL,
    `location` VARCHAR(150) NULL,
    `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_tokens` ADD CONSTRAINT `email_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_places_visit` ADD CONSTRAINT `tour_places_visit_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

