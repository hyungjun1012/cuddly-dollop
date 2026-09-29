ALTER TABLE `journal_entries` ADD `record_type` text DEFAULT 'update' NOT NULL;
--> statement-breakpoint
UPDATE `journal_entries`
SET `record_type` = 'initial'
WHERE `id` IN (
  SELECT first.`id`
  FROM `journal_entries` AS first
  WHERE first.`id` = (
    SELECT candidate.`id`
    FROM `journal_entries` AS candidate
    WHERE candidate.`stock_id` = first.`stock_id`
    ORDER BY candidate.`recorded_at` ASC, candidate.`id` ASC
    LIMIT 1
  )
);
