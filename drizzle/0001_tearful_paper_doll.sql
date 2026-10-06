CREATE TABLE `editions` (
	`number` integer PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`opens_at` integer NOT NULL,
	`closes_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editions_question_unique` ON `editions` (`question`);--> statement-breakpoint
CREATE UNIQUE INDEX `editions_opens_at_unique` ON `editions` (`opens_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`interval_hours` integer NOT NULL
);
