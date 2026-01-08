import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: int().primaryKey(),
  name: text().notNull(),
  age: int().notNull(),
  weight: int()
});

export const periods = sqliteTable("periods", {
    periodId: text().primaryKey(),
    // 0: spotting, 1: low, 2: medium, 3: high
    intensity: int().notNull(),
    userId: int().references(() => users.userId).notNull()
});

export const days = sqliteTable("days", {
  date: int({ mode: 'timestamp' }).primaryKey(),
  userId: int(),
  isPeriodDay: int({ mode: 'boolean' }),
  periodId: text().references(() => periods.periodId).notNull() // can be null if loggedDay is not a period day
});

export const symptoms = sqliteTable("symptoms", {
    symptomId: text().primaryKey(),
    date: int({ mode: 'timestamp' }).references(() => days.date).notNull()
});

export const notes = sqliteTable("notes", {
    noteId: text().primaryKey(),
    date: int({ mode: 'timestamp' }).references(() => days.date).notNull()
});
