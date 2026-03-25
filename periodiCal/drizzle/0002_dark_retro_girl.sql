PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_periods` (
	`periodId` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_periods`("periodId", "userId", "startDate", "endDate") SELECT "periodId", "userId", "startDate", "endDate" FROM `periods`;--> statement-breakpoint
DROP TABLE `periods`;--> statement-breakpoint
ALTER TABLE `__new_periods` RENAME TO `periods`;--> statement-breakpoint
PRAGMA foreign_keys=ON;