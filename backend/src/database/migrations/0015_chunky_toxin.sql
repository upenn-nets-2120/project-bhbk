CREATE TABLE IF NOT EXISTS `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users_chats` (
	`user_id` int NOT NULL,
	`chat_id` int NOT NULL,
	CONSTRAINT `users_chats_user_id_chat_id_pk` PRIMARY KEY(`user_id`,`chat_id`)
);
--> statement-breakpoint
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_id_chat_id_fk`;
--> statement-breakpoint
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_id_chat_memberId_fk`;
--> statement-breakpoint
ALTER TABLE `chat_messages` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `chat_id` int;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `sender_id` int;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_chats` ADD CONSTRAINT `users_chats_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_chats` ADD CONSTRAINT `users_chats_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TABLE `chat`;