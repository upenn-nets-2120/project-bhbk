CREATE TABLE `friend_recommendations` (
	`user_id` int NOT NULL,
	`friend_rec_id` int NOT NULL,
	`rank` int NOT NULL,
	CONSTRAINT `friend_recommendations_user_id_friend_rec_id_pk` PRIMARY KEY(`user_id`,`friend_rec_id`)
);
--> statement-breakpoint
CREATE TABLE `post_recommendations` (
	`user_id` int NOT NULL,
	`post_id` int NOT NULL,
	`rank` int NOT NULL,
	CONSTRAINT `post_recommendations_user_id_post_id_pk` PRIMARY KEY(`user_id`,`post_id`)
);
--> statement-breakpoint
ALTER TABLE `friend_recommendations` ADD CONSTRAINT `friend_recommendations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friend_recommendations` ADD CONSTRAINT `friend_recommendations_friend_rec_id_users_id_fk` FOREIGN KEY (`friend_rec_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_recommendations` ADD CONSTRAINT `post_recommendations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_recommendations` ADD CONSTRAINT `post_recommendations_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;