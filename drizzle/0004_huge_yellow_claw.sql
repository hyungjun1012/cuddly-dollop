ALTER TABLE `portfolio_settings` ADD `cash_krw` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolio_settings` ADD `cash_usd` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `portfolio_settings` SET `cash_krw` = `cash` WHERE `cash_krw` = 0;--> statement-breakpoint
ALTER TABLE `stocks` ADD `currency` text DEFAULT 'KRW' NOT NULL;
