import { addDays, formatISO, isSameMonth, isToday, startOfISOWeek, startOfMonth } from "date-fns";
import { CalendarDay } from "@/types/calendar-types";
import { fetchMonthDataFromDb } from "@/db/calendar-queries";

/**
 * Creates the 42 calendar cell entries used for rendering the current calendar view shown to the user.
 * @param viewingDate which month's page the calendar is turned to
 * @returns flat 1D array of calendar days used to fill calendar grid viewed by the user
 */
export function getCalendarGridForMonth(viewingDate: Date): CalendarDay[] {
    let calendarDays = []
    
    // 1. Get the 1st of the month the user is looking at
    const firstOfMonth = startOfMonth(viewingDate);

    // 2. Get the Monday that starts the grid
    // asking for the last Monday of this specific week to fill grid gaps (overlapping months, etc.)
    const gridStartDate = startOfISOWeek(firstOfMonth);
    
    let current_date = gridStartDate;

    for (let index = 0; index < 42; index++) {
        // generated day
        let calendarDay: CalendarDay = {
            dateString: formatISO(current_date, { representation: 'date' }),
            dayNumber: current_date.getDate(),
            // check if generated day is in the same month as the one user is viewing
            isCurrentMonth: isSameMonth(current_date, firstOfMonth),
            isItToday: isToday(current_date),
            date: new Date(current_date)
        };
        
        calendarDays.push(calendarDay);
        current_date = addDays(current_date, 1);
    }

    return calendarDays;
}

export async function fillCalendarGridWithDatabaseResults(viewingDate: Date, userId: string) {
    let rawCalendarGrid: CalendarDay[] = getCalendarGridForMonth(viewingDate);
    let startDate: string = rawCalendarGrid[0].dateString;
    let endDate: string = rawCalendarGrid[41].dateString;

    let monthData = await fetchMonthDataFromDb(userId, startDate, endDate);
    // transform monthData to lookup map
    let monthDataLookUp = new Map(monthData.map(item => [item.date, item]));

    // for each of the calendar cells i.e. days, check if there is some database data, if so, set Metadata accordingly
    const enrichedDays: CalendarDay[] = rawCalendarGrid.map((day: CalendarDay) => {
        const dbEntry = monthDataLookUp.get(day.dateString);
        
        if (!dbEntry) return day; // if no additional data was recorded by the user, leave as is

        return {
            // could also use ...day to take everything from day, and only add the new fields
            dateString: day.dateString, 
            dayNumber: day.dayNumber,
            isCurrentMonth: day.isCurrentMonth,
            isItToday: day.isItToday,
            date: day.date,

            isPeriodDay: dbEntry.isPeriodDay ?? false,
            intensity: dbEntry.periodDayInfo?.intensity ?? null,
            symptoms: dbEntry.symptoms?.map((s: any) => s.symptom) || [],
            notes: dbEntry.notes?.map((n: any) => n.note) || [],
            hasSymptoms: dbEntry.symptoms?.length > 0,
            hasNotes: dbEntry.notes?.length > 0,
        }
    });
    return enrichedDays;
}
