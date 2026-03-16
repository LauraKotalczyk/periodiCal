import { foreignKey, int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text().primaryKey(),
  name: text().notNull(),
  age: int().notNull(),
  weight: int()
});

export const periods = sqliteTable("periods", {
    periodId: text().primaryKey(),
    userId: text().references(() => users.userId).notNull(),
    startDate: text().notNull(), // Start date of the period (not a FK)
    endDate: text().notNull()    // End date of the period (not a FK)
});

export const days = sqliteTable("days", {
    date: text().notNull(), // stores dates as YYYY-MM-DD for simpler processing
    userId: text().references(() => users.userId).notNull(),
    isPeriodDay: int({ mode: 'boolean' })
}, (table) => [
    primaryKey({ columns: [table.date, table.userId] })
]);

export const periodDays = sqliteTable("period_days", {
    periodId: text().references(() => periods.periodId).notNull(),
    date: text().notNull().references(() => days.date),
    userId: text().notNull().references(() => users.userId),
    intensity: int(), // 0: spotting, 1: low, 2: medium, 3: high
    symptoms: text() // Optional: comma-separated list of symptom IDs
}, (table) => [
    primaryKey({ columns: [table.periodId, table.date, table.userId] })
]);

export const symptoms = sqliteTable("symptoms", {
    symptomId: text().primaryKey(),
    date: text().notNull().references(() => days.date),
    userId: text().notNull().references(() => users.userId),
    symptom: text().notNull() // Type of symptom (e.g., cramps, headache)
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
