export const testUser: any = {
    userId: "TestUser01", 
    name: 'Test-User01', 
    age: 30 
}

export const periodDay: any = {
    date: '2025-01-10',
    userId: testUser.userId,
    isPeriodDay: true
}

export const notPeriodDay: any = {
    date: '2025-01-10',
    userId: testUser.userId,
    isPeriodDay: false
}

export const oneSymptomEntry: any = {
    symptomId: 's1',
    date: '2025-01-10',
    userId: 'test01',
    symptom: 'Headache' 
}

export const twoSymptomEntry: any = { // TODO: check how they are handed over 
    symptomId: 's1',
    date: '2025-01-10',
    userId: testUser.userId,
    symptom: 'Headache' 
}