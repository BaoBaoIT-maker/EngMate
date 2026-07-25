-- AlterTable
ALTER TABLE `user_settings` ADD COLUMN `daily_word_goal` INTEGER NOT NULL DEFAULT 15,
    ADD COLUMN `onboarding_done` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `user_learning_paths` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `category` ENUM('GENERAL', 'TOEIC', 'IELTS') NOT NULL,
    `current_level` ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL DEFAULT 'A1',
    `target_score` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_learning_paths_user_id_category_key`(`user_id`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_learning_paths` ADD CONSTRAINT `user_learning_paths_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
