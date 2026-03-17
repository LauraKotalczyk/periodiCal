import { DayMetadata } from '../types/calendar';

export const getDaysInMonth = (year: number, month: number): DayMetadata[] => {
  // Use local time to avoid timezone shifts during calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  
  const days: DayMetadata[] = [];
  
  // Previous month days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDate - i);
    days.push({
      date: formatDate(d),
      isCurrentMonth: false,
      isToday: isToday(d),
      dayOfMonth: d.getDate(),
    });
  }

  // Current month days
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: formatDate(d),
      isCurrentMonth: true,
      isToday: isToday(d),
      dayOfMonth: i,
    });
  }

  // Next month days to complete 6 rows (42 days)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: formatDate(d),
      isCurrentMonth: false,
      isToday: isToday(d),
      dayOfMonth: i,
    });
  }

  return days;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
