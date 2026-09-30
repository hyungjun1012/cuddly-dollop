ALTER TABLE `portfolio_settings` ADD `initial_setup_completed` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE `portfolio_settings` SET `initial_setup_completed` = true;
