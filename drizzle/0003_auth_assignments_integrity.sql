-- Authentication history, idempotent daily visits, and assignment fields used
-- by the teacher/student APIs.

ALTER TABLE `users` ADD COLUMN `google_subject` TEXT;
ALTER TABLE `users` ADD COLUMN `last_login_at` TEXT;
ALTER TABLE `users` ADD COLUMN `login_count` INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS `users_google_subject_unique`
ON `users` (`google_subject`)
WHERE `google_subject` IS NOT NULL;

ALTER TABLE `assignments` ADD COLUMN `category` TEXT NOT NULL DEFAULT '일반';
ALTER TABLE `assignments` ADD COLUMN `content` TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS `assignment_submissions_assignment_student_unique`
ON `assignment_submissions` (`assignment_id`, `student_email`);

CREATE TABLE IF NOT EXISTS `daily_visits` (
  `user_email` TEXT NOT NULL REFERENCES `users`(`email`) ON DELETE CASCADE,
  `visit_date` TEXT NOT NULL,
  `visited_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_email`, `visit_date`)
);

-- Preserve existing visit history so applying this migration does not grant a
-- duplicate visit reward on the next page load.
INSERT OR IGNORE INTO `daily_visits` (`user_email`, `visit_date`)
SELECT `email`, `last_visit_date`
FROM `users`
WHERE `last_visit_date` <> '';
