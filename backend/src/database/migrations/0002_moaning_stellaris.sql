ALTER TABLE `users` RENAME COLUMN `name` TO `username`;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(256);