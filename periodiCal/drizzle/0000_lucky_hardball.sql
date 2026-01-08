CREATE TABLE `days` (
	`date` integer PRIMARY KEY NOT NULL,
	`userId` integer,
	`isPeriodDay` integer,
	`periodId` text NOT NULL,
	FOREIGN KEY (`periodId`) REFERENCES `periods`(`periodId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`noteId` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	FOREIGN KEY (`date`) REFERENCES `days`(`date`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`periodId` text PRIMARY KEY NOT NULL,
	`intensity` integer NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`symptomId` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	FOREIGN KEY (`date`) REFERENCES `days`(`date`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`userId` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`weight` integer
);
