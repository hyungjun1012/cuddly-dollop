CREATE TABLE `user_portfolios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`cash` integer DEFAULT 0 NOT NULL,
	`cash_krw` integer DEFAULT 0 NOT NULL,
	`cash_usd` integer DEFAULT 0 NOT NULL,
	`exchange_rate` real DEFAULT 1400 NOT NULL,
	`initial_setup_completed` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_portfolios_owner_id_unique` ON `user_portfolios` (`owner_id`);--> statement-breakpoint
ALTER TABLE `journal_documents` ADD `owner_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_journal_documents_owner_entry` ON `journal_documents` (`owner_id`,`journal_entry_id`);--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `owner_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_journal_entries_owner_recorded` ON `journal_entries` (`owner_id`,`recorded_at`);--> statement-breakpoint
ALTER TABLE `stocks` ADD `owner_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_stocks_owner_created` ON `stocks` (`owner_id`,`created_at`);