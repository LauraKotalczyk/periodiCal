export interface DayMetadata {
  date: string; // "YYYY-MM-DD"
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
}

export interface DayData {
  isPeriodDay?: boolean;
  intensity?: number | null; // 0: spotting, 1: low, 2: medium, 3: high
  symptoms?: string[];
  hasNote?: boolean;
}

export type CalendarDay = DayMetadata & DayData;
