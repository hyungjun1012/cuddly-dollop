ALTER TABLE `stocks` ADD `status` text DEFAULT 'watching' NOT NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD `memo` text DEFAULT '' NOT NULL;