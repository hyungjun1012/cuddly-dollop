ALTER TABLE `stocks` ADD `initial_quantity` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stocks` ADD `initial_average_cost` real DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `stocks` SET `initial_quantity` = `quantity`, `initial_average_cost` = `average_cost`;
