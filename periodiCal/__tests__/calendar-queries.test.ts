import { cleanTestDatabase, createTestDatabase } from './test-utils/db';
import { days, symptoms, periodDays, users, notes, periods } from '../db/schema';
import { fetchDayDetails } from '../db/calendar-queries';
import { notPeriodDay, oneSymptomEntry, periodDay, testUser } from './test-utils/test-profiles';
import { date } from 'drizzle-orm/mysql-core';

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

/**
 * USER-TABLE RELATED
 */
 


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
    testDb.insert(symptoms).values(oneSymptomEntry).run();

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

});

describe('setEndDate', () => {

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
