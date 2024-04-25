ALTER TABLE `users` RENAME COLUMN `name` TO `username`;--> statement-breakpoint
ALTER TABLE `comments` DROP FOREIGN KEY `comments_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_likes` DROP FOREIGN KEY `post_likes_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `posts` DROP FOREIGN KEY `posts_authorId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(256);--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_likes` ADD CONSTRAINT `post_likes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;