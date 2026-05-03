import { cleanTestDatabase, createTestDatabase } from './test-utils/db';
import { days, symptoms, periodDays, users, notes, periods } from '../db/schema';
import { fetchDayDetails } from '../db/calendar-queries';

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

  it('returns a day with its symptoms and null for period info if not present', async () => {
    testDb.insert(users).values({ userId: 'test01', name: 'Test-User', age: 30 }).run();
    testDb.insert(days).values({ date: '2025-01-10', userId: 'test01', isPeriodDay: true }).run();
    testDb.insert(symptoms).values({ symptomId: 's1', date: '2025-01-10', userId: 'test01', symptom: 'Headache' }).run();

    const result = await fetchDayDetails('test01', '2025-01-10');

    expect(result).toBeTruthy();
    expect(result?.date).toBe('2025-01-10');
    expect(result?.symptoms).toHaveLength(1);
    expect(result?.symptoms[0].symptom).toBe('Headache');
    // periodDayInfo will be null because we didn't insert any
    expect(result?.periodDayInfo).toBeNull();
  });

  // TODO: check how to independently test periods and periodDays  table insertion...
  it('returns a day with its symptoms and period info when present', async () => {
    testDb.insert(users).values({ userId: 'test01', name: 'Test-User', age: 30 }).run();
    testDb.insert(days).values({ date: '2025-01-10', userId: 'test01', isPeriodDay: true }).run();
    testDb.insert(symptoms).values({ symptomId: 's1', date: '2025-01-10', userId: 'test01', symptom: 'Headache' }).run();

    const result = await fetchDayDetails('test01', '2025-01-10');

    expect(result).toBeTruthy();
    expect(result?.date).toBe('2025-01-10');
    expect(result?.symptoms).toHaveLength(1);
    expect(result?.symptoms[0].symptom).toBe('Headache');
    // periodDayInfo will be null because we didn't insert any
    expect(result?.periodDayInfo).toBeNull();
  });

  it('returns null when the day does not exist', async () => {
    const result = await fetchDayDetails('test01', '2025-12-31');
    expect(result).toBeFalsy();
  });
});