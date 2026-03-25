export interface DayMetadata {
  // --- Logic related attributes (always present) --- 
  dateString: string; // "YYYY-MM-DD"
  dayNumber: number;
  isCurrentMonth: boolean;
  isItToday: boolean;
  date: Date;

  // --- Database schema related attributes (optional) ---
  isPeriodDay?: boolean;
  intensity?: number | null;
  symptoms?: string[];
  notes?: string[];
  hasSymptoms?: boolean;
  hasNotes?: boolean;
}

export type CalendarDay = DayMetadata;
