ALTER TABLE `journal_entries` ADD `entry_kind` text DEFAULT 'journal' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `trade_side` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `trade_quantity` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `trade_price` real DEFAULT 0 NOT NULL;