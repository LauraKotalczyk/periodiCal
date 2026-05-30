import { createTestDatabase } from './test-utils/db';
import { symptoms, periodDays, days, users } from '../db/schema';
import { getCalendarGridForMonth } from '../services/calendar-service';

let testDb: ReturnType<typeof createTestDatabase>;

// Mock the client so that `db` inside calendar-queries becomes testDb
jest.mock('../db/client', () => ({
  __esModule: true,
  get db() {
    return testDb;
  },
})); 

describe('calendar-service', () => {
  beforeAll(() => {
    testDb = createTestDatabase();
  });

  beforeEach(() => {
    testDb.delete(symptoms).run();
    testDb.delete(periodDays).run();
    testDb.delete(days).run();
    testDb.delete(users).run();
  });

  it('generates a 42-day calendar grid', () => {
    const grid = getCalendarGridForMonth(new Date('2025-01-01'));
    expect(grid).toHaveLength(42);
    // Jan 1st 2025 is Wednesday.
    // startOfISOWeek for 2025-01-01 (Mon) should be 2024-12-30
    expect(grid[0].dateString).toBe('2024-12-30');
  });
});
