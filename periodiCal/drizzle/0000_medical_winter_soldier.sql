CREATE TABLE `days` (
	`date` integer NOT NULL,
	`userId` text NOT NULL,
	`isPeriodDay` integer,
	`periodId` text,
	PRIMARY KEY(`date`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`periodId`) REFERENCES `periods`(`periodId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`noteId` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`periodId` text PRIMARY KEY NOT NULL,
	`intensity` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`symptomId` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`userId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`weight` integer
);
