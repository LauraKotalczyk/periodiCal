CREATE TABLE `days` (
	`date` text NOT NULL,
	`userId` text NOT NULL,
	`isPeriodDay` integer,
	PRIMARY KEY(`date`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`noteId` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `period_days` (
	`periodId` text NOT NULL,
	`date` text NOT NULL,
	`userId` text NOT NULL,
	`intensity` integer,
	`symptoms` text,
	PRIMARY KEY(`periodId`, `date`, `userId`),
	FOREIGN KEY (`periodId`) REFERENCES `periods`(`periodId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`date`) REFERENCES `days`(`date`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`periodId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `symptoms` (
	`symptomId` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`userId` text NOT NULL,
	`symptom` text NOT NULL,
	FOREIGN KEY (`date`) REFERENCES `days`(`date`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`userId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`weight` integer
);
