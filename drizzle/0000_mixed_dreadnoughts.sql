CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`a` text NOT NULL,
	`b` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`question` text NOT NULL,
	`voter` text NOT NULL,
	`choice` integer NOT NULL,
	PRIMARY KEY(`question`, `voter`)
);
