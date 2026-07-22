CREATE TABLE `admin_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_email` text NOT NULL,
	`action` text NOT NULL,
	`content_id` integer,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`source_title` text DEFAULT '' NOT NULL,
	`creator` text DEFAULT '' NOT NULL,
	`korean_text` text NOT NULL,
	`translation` text DEFAULT '' NOT NULL,
	`audio_female_url` text DEFAULT '' NOT NULL,
	`audio_male_url` text DEFAULT '' NOT NULL,
	`rights_status` text DEFAULT 'permission_pending' NOT NULL,
	`rights_note` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`user_email` text PRIMARY KEY NOT NULL,
	`current_lesson` integer DEFAULT 0 NOT NULL,
	`completed_sentences` integer DEFAULT 0 NOT NULL,
	`total_sentences` integer DEFAULT 5 NOT NULL,
	`typing_seconds` integer DEFAULT 0 NOT NULL,
	`accuracy` integer DEFAULT 100 NOT NULL,
	`lesson_finished` integer DEFAULT false NOT NULL,
	`awarded_xp` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`user_email` text NOT NULL,
	`reward_code` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`earned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_email`, `reward_code`),
	FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_visit_date` text NOT NULL,
	`streak_days` integer DEFAULT 1 NOT NULL,
	`longest_streak` integer DEFAULT 1 NOT NULL,
	`total_visits` integer DEFAULT 1 NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL
);
