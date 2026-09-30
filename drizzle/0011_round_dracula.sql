ALTER TABLE `journal_entries` ADD `holding_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD `holding_started_at` text;