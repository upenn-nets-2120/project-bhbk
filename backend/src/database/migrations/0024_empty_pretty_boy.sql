ALTER TABLE `friend_recommendations` MODIFY COLUMN `rank` decimal(20,10) NOT NULL;--> statement-breakpoint
ALTER TABLE `post_recommendations` MODIFY COLUMN `rank` decimal(20,10) NOT NULL;