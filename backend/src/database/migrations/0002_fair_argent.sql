CREATE TABLE `comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`postId` int,
	`authorId` int,
	`content` varchar(2048),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`postId` int,
	`userId` int,
	`likedAt` timestamp DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`contentUrl` varchar(2048),
	`caption` varchar(280),
	`authorId` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
