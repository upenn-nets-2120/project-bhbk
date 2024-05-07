ALTER TABLE `comments` DROP FOREIGN KEY `comments_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;