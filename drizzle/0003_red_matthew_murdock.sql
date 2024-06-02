CREATE TABLE `client` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`number` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	`is_active` integer
);
--> statement-breakpoint
DROP TABLE `employer`;--> statement-breakpoint
CREATE UNIQUE INDEX `client_id_unique` ON `client` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_number_unique` ON `client` (`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);