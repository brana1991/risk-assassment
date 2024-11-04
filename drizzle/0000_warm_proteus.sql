CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`identity_number` integer NOT NULL,
	`pib` integer NOT NULL,
	`responsible_person` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text,
	`client_id` text,
	`type` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`session_start` text NOT NULL,
	`session_end` text,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
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
CREATE UNIQUE INDEX `client_id_unique` ON `client` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_pib_unique` ON `client` (`pib`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);