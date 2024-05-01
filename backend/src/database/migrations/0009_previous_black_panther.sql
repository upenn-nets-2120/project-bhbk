CREATE TABLE `user_hashtags` (
	`user_id` int NOT NULL,
	`hashtag_id` int NOT NULL,
	CONSTRAINT `user_hashtags_user_id_hashtag_id_pk` PRIMARY KEY(`user_id`,`hashtag_id`)
);
--> statement-breakpoint
ALTER TABLE `user_hashtags` ADD CONSTRAINT `user_hashtags_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_hashtags` ADD CONSTRAINT `user_hashtags_hashtag_id_hashtags_id_fk` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtags`(`id`) ON DELETE no action ON UPDATE no action;