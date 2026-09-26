CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stock_id` integer NOT NULL,
	`recorded_at` text NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`roe` real DEFAULT 0 NOT NULL,
	`per` real DEFAULT 0 NOT NULL,
	`dividend_yield` real DEFAULT 0 NOT NULL,
	`short_comment` text DEFAULT '' NOT NULL,
	`mindset` text DEFAULT '' NOT NULL,
	`thesis` text DEFAULT '' NOT NULL,
	`risk_plan` text DEFAULT '' NOT NULL,
	`review` text DEFAULT '' NOT NULL,
	`biases` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`stock_id`) REFERENCES `stocks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`ticker` text DEFAULT '' NOT NULL,
	`target_weight` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
