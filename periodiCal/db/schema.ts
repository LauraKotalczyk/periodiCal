import { relations } from "drizzle-orm";
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
    endDate: text()    // End date of the period (not a FK)
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
  note: text().notNull()
}, (table) => [
  foreignKey({
    columns: [table.date, table.userId],
    foreignColumns: [days.date, days.userId],
  })
]);

// a "Day" has many symptoms, notes, etc.
export const daysRelations = relations(days, ({ many, one }) => ({
  symptoms: many(symptoms), // one day can have multiple symptom rows associated with it
  notes: many(notes),
  periodDayInfo: one(periodDays, { // One period entry per day
    fields: [days.date, days.userId],
    references: [periodDays.date, periodDays.userId],
  }),
}));

// Map the other side
export const symptomsRelations = relations(symptoms, ({ one }) => ({
  day: one(days, { // every single row in symptoms table belong to exactly one day
    // Todo: Maybe needs a change, since symptoms are planned to be a predefined list
    fields: [symptoms.date, symptoms.userId],
    references: [days.date, days.userId],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  day: one(days, {
    fields: [notes.date, notes.userId],
    references: [days.date, days.userId],
  }),
}));
