PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_days` (
	`date` text NOT NULL,
	`userId` text NOT NULL,
	`isPeriodDay` integer,
	`periodId` text,
	PRIMARY KEY(`date`, `userId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`periodId`) REFERENCES `periods`(`periodId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_days`("date", "userId", "isPeriodDay", "periodId") SELECT "date", "userId", "isPeriodDay", "periodId" FROM `days`;--> statement-breakpoint
DROP TABLE `days`;--> statement-breakpoint
ALTER TABLE `__new_days` RENAME TO `days`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`noteId` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_notes`("noteId", "date", "userId") SELECT "noteId", "date", "userId" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
CREATE TABLE `__new_symptoms` (
	`symptomId` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`date`,`userId`) REFERENCES `days`(`date`,`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_symptoms`("symptomId", "date", "userId") SELECT "symptomId", "date", "userId" FROM `symptoms`;--> statement-breakpoint
DROP TABLE `symptoms`;--> statement-breakpoint
ALTER TABLE `__new_symptoms` RENAME TO `symptoms`;