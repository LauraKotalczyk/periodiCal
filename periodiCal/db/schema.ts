import { foreignKey, int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text().primaryKey(),
  name: text().notNull(),
  age: int().notNull(),
  weight: int()
});

export const periods = sqliteTable("periods", {
    periodId: text().primaryKey(),
    // 0: spotting, 1: low, 2: medium, 3: high
    intensity: int().notNull(),
    userId: text().references(() => users.userId).notNull()
});

export const days = sqliteTable("days", {
  date: text().notNull(), // stores dates as YYYY-MM-DD for simpler processing
  userId: text().references(() => users.userId).notNull(),
  isPeriodDay: int({ mode: 'boolean' }),
  periodId: text().references(() => periods.periodId) // can be null if loggedDay is not a period day
}, (table) => [
  primaryKey({ columns: [table.date, table.userId] })
]);

export const symptoms = sqliteTable("symptoms", {
  symptomId: text().primaryKey(),
  date: text().notNull(),
  userId: text().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.date, table.userId],
    foreignColumns: [days.date, days.userId],
  })
]);

export const notes = sqliteTable("notes", {
  noteId: text().primaryKey(),
  date: text().notNull(),
  userId: text().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.date, table.userId],
    foreignColumns: [days.date, days.userId],
  })
]);
