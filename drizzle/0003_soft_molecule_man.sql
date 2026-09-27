CREATE TABLE `portfolio_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`cash` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `stocks` ADD `market` text DEFAULT 'OTHER' NOT NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD `sector` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD `investment_style` text DEFAULT 'other' NOT NULL;