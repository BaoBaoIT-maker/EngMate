-- Keep learning-path targets, but move measured level/score into user_path_progresses.

ALTER TABLE `user_learning_paths`
  ADD COLUMN `target_level` VARCHAR(50) NULL,
  ADD COLUMN `target_word_count` INTEGER NULL;

UPDATE `user_learning_paths`
SET `target_level` = CASE
  WHEN `target_score` IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') THEN `target_score`
  WHEN `current_level` IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') THEN `current_level`
  ELSE NULL
END;

CREATE TABLE `user_path_progresses` (
  `path_id` INTEGER NOT NULL,
  `user_id` INTEGER NOT NULL,
  `current_level` VARCHAR(50) NOT NULL DEFAULT 'A1',
  `vocabulary_score` INTEGER NOT NULL DEFAULT 0,
  `total_words` INTEGER NOT NULL DEFAULT 0,
  `studied_words` INTEGER NOT NULL DEFAULT 0,
  `mastered_words` INTEGER NOT NULL DEFAULT 0,
  `accuracy` DOUBLE NOT NULL DEFAULT 0,
  `progress_to_target` DOUBLE NOT NULL DEFAULT 0,
  `level_breakdown` JSON NULL,
  `last_evaluated_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`path_id`),
  INDEX `user_path_progresses_user_id_idx` (`user_id`),
  CONSTRAINT `user_path_progresses_path_id_fkey`
    FOREIGN KEY (`path_id`) REFERENCES `user_learning_paths`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_path_progresses_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE `user_learning_paths`
  DROP COLUMN `current_level`;

ALTER TABLE `user_skills`
  DROP COLUMN `current_level`,
  DROP COLUMN `vocabulary_score`,
  DROP COLUMN `grammar_score`,
  DROP COLUMN `speaking_score`,
  DROP COLUMN `ai_chat_count_today`,
  DROP COLUMN `last_ai_chat_date`;
