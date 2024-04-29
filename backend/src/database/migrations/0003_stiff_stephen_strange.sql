CREATE TABLE `chat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	`memberId` int,
	CONSTRAINT `chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int,
	`content` text,
	`sentAt` timestamp DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN `contentUrl` TO `imageUrl`;--> statement-breakpoint
ALTER TABLE `posts` RENAME COLUMN `caption` TO `text`;--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `imageUrl` varchar(256);--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `text` text;--> statement-breakpoint
ALTER TABLE `chat` ADD CONSTRAINT `chat_memberId_users_id_fk` FOREIGN KEY (`memberId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_id_chat_id_fk` FOREIGN KEY (`id`) REFERENCES `chat`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_id_chat_memberId_fk` FOREIGN KEY (`id`) REFERENCES `chat`(`memberId`) ON DELETE no action ON UPDATE no action;