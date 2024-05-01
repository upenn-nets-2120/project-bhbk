CREATE TABLE `user_friends` (
	`user_id` int NOT NULL,
	`friend_id` int NOT NULL,
	CONSTRAINT `user_friends_user_id_friend_id_pk` PRIMARY KEY(`user_id`,`friend_id`)
);
--> statement-breakpoint
ALTER TABLE `user_friends` ADD CONSTRAINT `user_friends_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_friends` ADD CONSTRAINT `user_friends_friend_id_users_id_fk` FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;