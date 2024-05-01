CREATE TABLE `hashtags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int,
	`content` varchar(2048),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `hashtags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts_to_hashtags` (
	`post_id` int NOT NULL,
	`hashtag_id` int NOT NULL,
	CONSTRAINT `posts_to_hashtags_post_id` PRIMARY KEY(`post_id`)
);
--> statement-breakpoint
ALTER TABLE `hashtags` ADD CONSTRAINT `hashtags_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts_to_hashtags` ADD CONSTRAINT `posts_to_hashtags_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `posts_to_hashtags` ADD CONSTRAINT `posts_to_hashtags_hashtag_id_hashtags_id_fk` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtags`(`id`) ON DELETE cascade ON UPDATE cascade;