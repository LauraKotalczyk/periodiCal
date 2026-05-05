import { periodDays } from '../../db/schema';
export const testUser: any = {
    userId: 'TestUser01', 
    name: 'TestUser01', 
    age: 30 
}

export const periodDay: any = {
    date: '2026-05-04',
    userId: testUser.userId,
    isPeriodDay: true
}

export const periodDayTwo: any = {
    date: '2026-05-05',
    userId: testUser.userId,
    isPeriodDay: true
}

export const notPeriodDay: any = {
    date: '2026-05-05',
    userId: testUser.userId,
    isPeriodDay: false
}

export const oneSymptomEntry: any = {
    symptomId: 's1',
    date: '2026-05-04',
    userId: 'test01',
    symptom: 'Headache' 
}

export const twoSymptomEntry: any = { // TODO: check how they are handed over 
    symptomId: 's1',
    date: '2026-05-04',
    userId: testUser.userId,
    symptom: 'Headache' 
}

export const periodWithDurationOne: any = {
    periodId: 'TestPeriod01',
    userId: testUser.userId,
    startDate: '2026-05-04',
    endDate: '2026-05-04' // one periodEntry so far
}

export const periodWithDurationTwo: any = {
    periodId: 'TestPeriod01',
    userId: testUser.userId,
    startDate: '2026-05-04',
    endDate: '2026-05-05' // one periodEntry so far
}

export const periodDayEntry: any = {
    periodId: periodWithDurationOne.periodId,
    date: periodWithDurationOne.startDate,
    userId: periodWithDurationOne.userId,
    intensity: 1
}

export const periodDayEntryTwo: any = {
    periodId: periodWithDurationOne.periodId,
    date: periodWithDurationTwo.endDate,
    userId: periodWithDurationOne.userId,
    intensity: 2
}
