-- Migration: 0001_b2b_expansion.sql
-- B2B SaaS Multi-tenant & School Class Structure Extension

CREATE TABLE IF NOT EXISTS `organizations` (
    `id` TEXT PRIMARY KEY,
    `name` TEXT NOT NULL,
    `plan_type` TEXT NOT NULL DEFAULT 'school_free',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `classes` (
    `id` TEXT PRIMARY KEY,
    `org_id` TEXT REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    `teacher_email` TEXT NOT NULL,
    `class_name` TEXT NOT NULL,
    `invite_code` TEXT NOT NULL UNIQUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `users` ADD COLUMN `role` TEXT NOT NULL DEFAULT 'student';
ALTER TABLE `users` ADD COLUMN `class_id` TEXT REFERENCES `classes`(`id`) ON DELETE SET NULL;
ALTER TABLE `users` ADD COLUMN `student_id` TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS `assignments` (
    `id` TEXT PRIMARY KEY,
    `class_id` TEXT NOT NULL REFERENCES `classes`(`id`) ON DELETE CASCADE,
    `title` TEXT NOT NULL,
    `target_level` INTEGER NOT NULL DEFAULT 1,
    `target_accuracy` INTEGER NOT NULL DEFAULT 90,
    `due_date` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id` TEXT PRIMARY KEY,
    `assignment_id` TEXT NOT NULL REFERENCES `assignments`(`id`) ON DELETE CASCADE,
    `student_email` TEXT NOT NULL REFERENCES `users`(`email`) ON DELETE CASCADE,
    `cpm` INTEGER NOT NULL DEFAULT 0,
    `accuracy` INTEGER NOT NULL DEFAULT 0,
    `completed` INTEGER NOT NULL DEFAULT 0,
    `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `class_summary` (
    `class_id` TEXT PRIMARY KEY REFERENCES `classes`(`id`) ON DELETE CASCADE,
    `total_students` INTEGER NOT NULL DEFAULT 0,
    `avg_cpm` INTEGER NOT NULL DEFAULT 0,
    `avg_accuracy` INTEGER NOT NULL DEFAULT 0,
    `total_completed_tasks` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP
);
