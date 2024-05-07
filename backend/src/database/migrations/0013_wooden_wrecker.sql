ALTER TABLE `posts_likes` DROP FOREIGN KEY `posts_likes_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `posts_likes` ADD CONSTRAINT `posts_likes_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;