ALTER TABLE `hashtags` DROP FOREIGN KEY `hashtags_postId_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `hashtags` DROP COLUMN `postId`;