import { log } from "./logger";

/**
 * 
 * @param dateISOString string of the form YYYY-MM-DD
 */
export function convertISOStringDateToPrintableDate(dateISOString: string) {
    if (!dateISOString) {
        log.error("DateString is not defined. Can't convert to printable Date");
        throw console.error("DateString is not defined. Can't convert to printable Date");
    }
    const dateParts: string[] = dateISOString.split('-');
    const year: string = dateParts[0];
    const month: string = dateParts[1];
    const day: string = dateParts[2];
    const printableDate: string = day + "." + month + "." + year;

    return printableDate;
}