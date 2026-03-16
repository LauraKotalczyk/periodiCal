import { DayMetadata } from '../types/calendar';

export const getDaysInMonth = (year: number, month: number): DayMetadata[] => {
  const date = new Date(year, month, 1);
  const days: DayMetadata[] = [];
  
  // Get the first day of the week for the 1st of the month
  // 0 (Sun) to 6 (Sat)
  const firstDayOfWeek = date.getDay();
  
  // Previous month days to fill the first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: formatDate(d),
      isCurrentMonth: false,
      isToday: isToday(d),
      dayOfMonth: d.getDate(),
    });
  }

  // Current month days
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDayOfMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: formatDate(d),
      isCurrentMonth: true,
      isToday: isToday(d),
      dayOfMonth: i,
    });
  }

  // Next month days to fill the last week
  const remainingDays = 42 - days.length; // 6 rows of 7 days
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
