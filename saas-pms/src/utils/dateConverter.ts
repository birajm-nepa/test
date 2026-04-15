import NepaliDate from 'nepali-date-converter'

/**
 * Converts a Gregorian (A.D.) date to Bikram Sambat (B.S.) string format.
 * Useful for Nepali official reporting.
 * @param date - The Gregorian Date object
 * @returns A formatted B.S. date string (e.g., "YYYY-MM-DD")
 */
export function convertAdToBs(date: Date): string {
  try {
    const nepaliDate = new NepaliDate(date)
    return nepaliDate.format('YYYY-MM-DD')
  } catch (error) {
    console.error('Error converting date:', error)
    return 'Invalid Date'
  }
}
