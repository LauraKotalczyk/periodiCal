import { db } from '@/db/client';
import { log } from '@/utils/logger';

/**
 * @param key string value used to access the dict value e.g. "symptom"
 * @param objectList List containing fetched symptoms / notes rows from db 
 * @returns string[] containing an aggregated list of symptom / note entries for a day
 * @example input:  "symptoms": [
      { "symptomId": "s1", "date": "2023-10-01", "userId": "user_123", "symptom": "Cramps" },
      { "symptomId": "s2", "date": "2023-10-01", "userId": "user_123", "symptom": "Headache" }
 *  output: ["Cramps", "Headache"]
 * 
 */
export function aggregateEntriesListForOneDay(objectList: any, key: string): string[] {
    let aggregatedEntries: string[] = []
    if (objectList === undefined || objectList.length === 0) {
        log.warn("The following object is empty: ", objectList);
    } else {
        for (let index = 0; index < objectList.length; index++) {
            const entry = objectList[index][key];
            aggregatedEntries.push(entry);
            log.info("Entry successfully added to aggregateList for key: ", key);
        }
    }
    return aggregatedEntries;
}
