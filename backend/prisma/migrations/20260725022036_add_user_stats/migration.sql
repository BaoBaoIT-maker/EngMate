-- AlterTable
ALTER TABLE `user_skills` ADD COLUMN `last_active_date` DATETIME(3) NULL,
    ADD COLUMN `max_streak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `streak_days` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_exp` INTEGER NOT NULL DEFAULT 0;
