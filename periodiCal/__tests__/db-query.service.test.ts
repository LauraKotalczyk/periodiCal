import { cleanTestDatabase, createTestDatabase } from './test-utils/db';
import { days, symptoms, periodDays, users, notes, periods } from '../db/schema';
import { deletePeriodDay, fetchDayDetails, setEndDate } from '../services/db-query-service';
import { notPeriodDay, oneSymptomEntry, periodDay, periodDayEntry, periodWithDurationOne, testUser } from './test-utils/test-profiles';
import { date } from 'drizzle-orm/mysql-core';
import { log } from "console";
import { and, eq} from 'drizzle-orm';

// Mocked database
let testDb: ReturnType<typeof createTestDatabase>;

// Mock the client so that `db` inside calendar-queries becomes testDb
jest.mock('../db/client', () => ({
  __esModule: true,
  get db() {
    return testDb;
  },
}));

describe('fetchDayDetails', () => {
  beforeAll(() => {
    testDb = createTestDatabase();
  });

  beforeEach(() => {
    cleanTestDatabase(testDb);
  });

  it('returns a day with its one symptom and null for period info if not present', async () => {
    testDb.insert(users).values({ userId: testUser.userId, name: testUser.name, age: testUser.age }).run();
    testDb.insert(days).values({ userId: testUser.userId, date: notPeriodDay.date, isPeriodDay: notPeriodDay.isPeriodDay }).run();
    testDb.insert(symptoms).values({ symptomId: 's1', date: notPeriodDay.date, userId: testUser.userId, symptom: oneSymptomEntry.symptom }).run();

    const result = await fetchDayDetails(testUser.userId, notPeriodDay.date);

    expect(result).toBeTruthy();
    expect(result?.date).toBe(notPeriodDay.date);
    expect(result?.symptoms).toHaveLength(1);
    expect(result?.symptoms[0].symptom).toBe(oneSymptomEntry.symptom);
    // periodDayInfo will be null because we didn't insert any
    expect(result?.periodDayInfo).toBeNull();
  });

  // TODO: check how to check multiple symptoms! check how to independently test periods and periodDays  table insertion...
  it('returns a day with its multiple symptoms and period info when present', async () => {
    testDb.insert(users).values(testUser).run();
    testDb.insert(days).values(periodDay).run();
    // Reusing periodDay date and userId for symptom entry to satisfy FK
    testDb.insert(symptoms).values({ ...oneSymptomEntry, date: periodDay.date, userId: testUser.userId }).run();

    const result = await fetchDayDetails(testUser.userId, periodDay.date);

    expect(result).toBeTruthy();
    expect(result?.date).toBe('2025-01-10');
    expect(result?.symptoms).toHaveLength(1);
    expect(result?.symptoms[0].symptom).toBe('Headache');
    // periodDayInfo will be null because we didn't insert any
    expect(result?.periodDayInfo).toBeNull();
  });

  it('returns null when the day does not exist', async () => {
    const result = await fetchDayDetails(testUser.userId, periodDay.date);
    expect(result).toBeFalsy();
  });

  it('returns a day with period info if present', async () => {
  
  });

  it('returns a day with respective notes', async () => {
  
  });
});

describe('deletePeriodDay', () => {
   beforeAll(() => {
    testDb = createTestDatabase();
  });

  beforeEach(() => {
    cleanTestDatabase(testDb);
  });

  const _periodId: string = periodWithDurationOne.periodId;
  const _userId: string = periodWithDurationOne.userId;
  const _startDate: string = periodWithDurationOne.startDate;

  // TODO: make sure to cover symptoms / notes as well somewhere
  it('removes a period day entry from the periodDays, periods and days table if no other period days exist yet', () => {
    testDb.insert(users).values(testUser).run();
    testDb.insert(days).values(periodDay).run(); // mark as period day
    testDb.insert(periods).values(periodWithDurationOne).run();   // the period itself
    testDb.insert(periodDays).values(periodDayEntry).run();

    deletePeriodDay(_userId, _startDate);

    // Assert: periodDays row should be gone
    const pdResult = testDb
      .select()
      .from(periodDays)
      .where(
        and(eq(periodDays.userId, _userId), eq(periodDays.date, _startDate), eq(periodDays.periodId, _periodId))
      )
      .all();
    expect(pdResult).toHaveLength(0);

    // Assert: the period itself should be deleted because it had no days left
    const periodResult = testDb
      .select()
      .from(periods)
      .where(
        and(eq(periods.periodId, _periodId), eq(periods.userId, _userId))
      )
      .all();
    expect(periodResult).toHaveLength(0);

    // Assert: the day still exists but isPeriodDay must now be false
    const dayResult = testDb
      .select()
      .from(days)
      .where(and(eq(days.userId, _userId), eq(days.date, _startDate)))
      .all();
    expect(dayResult).toHaveLength(1);
    expect(dayResult[0].isPeriodDay).toBe(false);
  });

  it('removes a period day entry from both the periodDays, periods and days table and updates period endDate', async () => {
    testDb.insert(users).values(testUser).run();
    testDb.insert(days).values(periodDay).run(); // mark as period day
    testDb.insert(periods).values(periodWithDurationOne).run();   // the period itself
    testDb.insert(periodDays).values(periodDayEntry).run();
        
  });

  // TODO: if user doesn't exist

  // TODO: if periodEntry doesn't exist

  // TODO: if periodEntry doesn't exist for that user

  //TODO: if entry to be removed is startDate, expect....

  //TODO: if entry to be removed is date somewhere in the middle, expect...

  //TODO: if no day remains for the respective periodId (i.e. to remove is the last periodEntry) remove entire period from db
});

describe('setEndDate', () => {
  beforeAll(() => {
    testDb = createTestDatabase();
  });

  beforeEach(() => {
    cleanTestDatabase(testDb);
  });
  
  const _periodId: string = periodWithDurationOne.periodId;
  const _userId: string = periodWithDurationOne.userId;
  const _startDate: string = periodWithDurationOne.startDate;

  it('if period entry does not exist', async () => {
    const result = await setEndDate(_userId, _periodId, _startDate);
    
    expect(result).toHaveLength(0);
  });

  it('sets endDate of period with existing periodId successfully', async () => {
    testDb.insert(users).values(testUser).run(); // to satisfy FK constraint
    testDb.insert(periods).values(periodWithDurationOne).run();

    const result = await setEndDate(_userId, _periodId, '2026-05-05');

    expect(result).toBeDefined();
    if (result) {
      expect(result).toHaveLength(1);
      expect(result[0].endDate).toBe("2026-05-05");
    }
  });
});

describe('fetchSelectedDayEntry', () => {

});

describe('insertNewPeriodDayIntoDaysTable', () => {

});

describe('insertNewPeriodDayIntoPeriodDaysTable', () => {

});

describe('insertNewPeriodIntoPeriodsTable', () => {

});

describe('fetchMonthDataFromDb', () => {

});

describe('fetchPeriod', () => {

});
