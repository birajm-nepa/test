declare module 'nepali-date-converter' {
  export default class NepaliDate {
    constructor(date?: Date | string | number | NepaliDate);
    constructor(year: number, month: number, date: number);
    format(formatStr: string): string;
    getYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
    getEnglishDate(): Date;
    setYear(year: number): void;
    setMonth(month: number): void;
    setDate(date: number): void;
  }
}
