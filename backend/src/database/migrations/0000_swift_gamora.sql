CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(256),
	`firstName` varchar(256),
	`lastName` varchar(256),
	`email` varchar(256),
	`password` varchar(256),
	`affiliation` varchar(256),
	`profileUrl` varchar(256),
	`dob` date,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
