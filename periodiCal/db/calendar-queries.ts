import { db } from '@/db/client';
import { and, eq, gte, lte } from 'drizzle-orm';
import { days, periodDays, periods } from './schema';
import { log } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { date } from 'drizzle-orm/mysql-core';

/**
 * @param startDate date string of the first calendar square visible for the current viewed month
 * @param endDate date string of the last calendar quare visible for the current viewed month
 * @returns Array of Objects, each object is one row from the days table, extended with additional data
 * @example returns: [
  {
    "date": "2023-10-01",
    "userId": "user_123",
    "isPeriodDay": true,
    "symptoms": [
      { "symptomId": "s1", "date": "2023-10-01", "userId": "user_123", "symptom": "Cramps" },
      { "symptomId": "s2", "date": "2023-10-01", "userId": "user_123", "symptom": "Headache" }
    ],
    "notes": [
      { "noteId": "n1", "date": "2023-10-01", "userId": "user_123", "note": "Feeling tired today." }
    ],
    "periodDayInfo": {
      "periodId": "p_abc",
      "date": "2023-10-01",
      "userId": "user_123",
      "intensity": 3
    }
  },
  // ... more days
]
 */
export async function fetchMonthDataFromDb(userId: string, startDate: string, endDate: string) {
    return await db.query.days.findMany({
        where: and(
        eq(days.userId, userId),
        gte(days.date, startDate),
        lte(days.date, endDate)
        ),
        with: {
        symptoms: true,      // Returns an array of symptoms
        notes: true,         // Returns an array of notes
        periodDayInfo: true  // Returns the period detail object
    }
  });
}

/**
 * Checks if a new period has already started / was already created
 * to verify which periodId to use.
 * retrieves userId and current selected data from UI
 * @returns (periodId, periodStartDate) or null if no active period
 */
export async function fetchPeriod(selectedDate: string, userId: string) {
  log.info("Fetching if there is an active period...");
  const result = await db.query.periods.findFirst({
    columns: {
      periodId: true,
      startDate: true
    },
    where: and(
      eq(periods.userId, userId),
      lte(periods.startDate, selectedDate),
      gte(periods.endDate, selectedDate) // to make sure we can smoothly add additional days to a period
    )
  });

  if (!result?.periodId) {
    log.info("No active period.");
    return [null, null] as const;
  }
  
  log.info("Active period with id: ", result.periodId);
  return [result.periodId, result.startDate] as const;
}

/**
 * Inserts a new period entry into the periods table for the specified user.
 * Generates a unique period ID and sets the end date to null.
 * 
 * @param userId - The ID of the user for whom the period entry is being created.
 * @param startDate - The start date of the period in string format.
 * @returns A promise that resolves to an array of the inserted rows, or undefined if an error occurs.
 * @throws Will log an error if the database insertion fails.
 */
export async function insertNewPeriodIntoPeriodsTable(userId: string, startDate: string) {
  const periodId: string = uuidv4();
  try {
    const result = await db.insert(periods).values({
      "periodId": periodId,
      "userId": userId,
      "startDate": startDate,
      "endDate": startDate
    }).returning();

    if (result) {
      log.info("Successfully wrote new periodEntry to period table.");
    }

    return result; // array of inserted rows e.g. [{ periodId: '...', userId: '...', ...}]

    } catch (error) {
      log.error("Transaction: Writing new periodEntry to periods table failed with: ", error);
    }
}

/**
 * Inserts a new period day entry into the periodDays table or updates the intensity if the entry already exists.
 * 
 * @param userId - The ID of the user who owns the period day entry
 * @param date - The date of the period day entry in string format
 * @param periodId - The ID of the period associated with this day
 * @param intensity - The intensity level of the period day (0-5 or similar scale)
 * 
 * @returns A promise that resolves to the inserted or updated period day record(s), or undefined if an error occurs.
 */
export async function insertNewPeriodDayIntoPeriodDaysTable(userId: string, date: string, periodId: string, intensity: number) {
  try {
    const result = await db.insert(periodDays)
    .values({ userId, date, periodId, intensity })
    .onConflictDoUpdate({
        target: [periodDays.userId, periodDays.date, periodDays.periodId],
        set: { intensity: intensity }
  })
  .returning();

  if (result) {
      log.info("Successfully wrote new periodDay to periodDays table.");
  }

  return result;

  } catch (error: any) {
    log.error("Transaction: Writing new periodDaysEntry to periodDays table failed with: ", error);
  }
}

/**
 * Insert or update a period day record for a user in the `days` table.
 *
 * Ensures that a row for the provided `userId` and `date` exists and is marked as a period day.
 * Uses an upsert pattern:
 * - inserts new row with `isPeriodDay: true` when no existing record matches.
 * - on conflict (by `userId`, `date`) updates `isPeriodDay` to `true`.
 *
 * @param userId - The identifier of the user for whom the period day is recorded.
 * @param date - The calendar date string (e.g. `YYYY-MM-DD`) to set as a period day.
 *
 * @returns A promise that resolves with the inserted/updated row data returned by `.returning()`.
 *          The exact shape depends on the query builder/ORM behavior and table schema.
 *
 * @throws Error when the database insert/update fails; database error details are logged.
 */
export async function insertNewPeriodDayIntoDaysTable(userId: string, date: string) {
  try {
    const result = await db.insert(days).values({
        "date": date,
        "userId": userId,
        "isPeriodDay": true
      })
      .onConflictDoUpdate({
        target: [days.userId, days.date],
        set: { isPeriodDay: true }
      })
      .returning();

    if (result) {
      log.info("Successfully wrote new periodDay to days table.");
    }
  } catch (error) {
    log.error("Transaction: Writing new periodDay to days table failed with: ", error);
  }
}

/**
 * If e.g. a symptom has already been logged that day, there already exists a log for this day in the database. Then we take the already existing entry.
 */
/**
 * Fetches a calendar day entry for a specific user and date.
 * 
 * @param userId - The unique identifier of the user
 * @param selectedDate - The date to fetch in string format
 * @returns A promise that resolves to the day entry containing the date and userId if found, or null if no entry exists
 * @throws May throw database query errors
 */
export async function fetchSelectedDayEntry(userId: string, selectedDate: string) {
  log.info("Fetching selectedDay from Database...");
  const result = await db.query.days.findFirst({
    columns: {
      date: true,
      userId: true
    },
    where: and(
      eq(days.userId, userId),
      eq(days.date, selectedDate)
    )
  });

  if (!result?.date) {
    log.info("No date entry for: ", date);
    return null;
  }
}

/**
 * Update the `endDate` of a period row in the database.
 *
 * @param userId - ID of the user owning the period. (Currently not used in query filter.)
 * @param periodId - ID of the period to update.
 * @param date - New end date value to set.
 * @returns Promise resolving to an array of updated period rows.
 * @throws When the database update query fails.
 */
export async function setEndDate(userId: string, periodId: string, date: string) {
  try {
    const result = await db
      .update(periods)
      .set({ endDate: date })
      .where(eq(periods.periodId, periodId))
      .returning();

    if (result) {
      log.info("Successfully set period endDate.");
    }

    return result; // array of updated rows e.g. [{ periodId: '...', userId: '...', ...}]

    } catch (error) {
      log.error("Transaction: Writing new periodEntry to database failed with: ", error);
    }
}
