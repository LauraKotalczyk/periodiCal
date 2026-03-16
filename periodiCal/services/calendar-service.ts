import { db } from '../db/client';
import { days, periodDays, symptoms } from '../db/schema';
import { eq, and, between } from 'drizzle-orm';

export class CalendarService {
    static async getDays(userId: string, startDate: string, endDate: string) {
        // Fetch all days in the range
        const dayData: typeof days.$inferSelect[] = await db
            .select()
            .from(days)
            .where(and(eq(days.userId, userId), between(days.date, startDate, endDate)));

        // Fetch period days in the range
        const periodDayData: typeof periodDays.$inferSelect[] = await db
            .select()
            .from(periodDays)
            .where(and(eq(periodDays.userId, userId), between(periodDays.date, startDate, endDate)));

        // Fetch symptoms in the range
        const symptomData: typeof symptoms.$inferSelect[] = await db
            .select()
            .from(symptoms)
            .where(and(eq(symptoms.userId, userId), between(symptoms.date, startDate, endDate)));

        // Map data into a format the frontend can use
        const calendarData = dayData.map((day) => {
            const periodDay = periodDayData.find((pd) => pd.date === day.date);
            const daySymptoms = symptomData
                .filter((symptom) => symptom.date === day.date)
                .map((symptom) => symptom.symptom);

            return {
                date: day.date,
                isPeriodDay: day.isPeriodDay,
                intensity: periodDay?.intensity || null,
                symptoms: daySymptoms,
            };
        });

        return calendarData;
    }

    static async updateDayData(userId: string, date: string, data: { isPeriodDay: boolean, intensity: number | null, symptoms: string[] }) {
        await db.transaction(async (tx) => {
            // Updated days table
            await tx.insert(days).values({
                date,
                userId,
                isPeriodDay: data.isPeriodDay
            }).onConflictDoUpdate({
                target: [days.date, days.userId],
                set: { isPeriodDay: data.isPeriodDay }
            });

            // Update period_days table
            await tx.delete(periodDays).where(and(eq(periodDays.date, date), eq(periodDays.userId, userId)));
            if (data.isPeriodDay) {
                await tx.insert(periodDays).values({
                    periodId: `period-${date}`, // Simplified for now
                    date,
                    userId,
                    intensity: data.intensity
                });
            }

            // Update symptoms table
            await tx.delete(symptoms).where(and(eq(symptoms.date, date), eq(symptoms.userId, userId)));
            for (const s of data.symptoms) {
                await tx.insert(symptoms).values({
                    symptomId: `${userId}-${date}-${s}`,
                    date,
                    userId,
                    symptom: s
                });
            }
        });
    }

}