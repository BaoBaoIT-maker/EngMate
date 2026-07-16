/*
  Warnings:

  - Added the required column `vietnamese_meaning` to the `system_vocabulary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `system_vocabulary_word_key` ON `system_vocabulary`;

-- AlterTable
ALTER TABLE `system_vocabulary` ADD COLUMN `topic_id` INTEGER NULL,
    ADD COLUMN `vietnamese_meaning` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `vocabulary_topics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('GENERAL', 'TOEIC', 'IELTS') NOT NULL DEFAULT 'GENERAL',
    `level` ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL DEFAULT 'B1',
    `is_premium` BOOLEAN NOT NULL DEFAULT false,
    `word_count` INTEGER NOT NULL DEFAULT 0,
    `thumbnail_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `vocabulary_topics_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_vocabulary` ADD CONSTRAINT `system_vocabulary_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `vocabulary_topics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
