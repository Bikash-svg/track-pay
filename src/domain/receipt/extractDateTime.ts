import type { OcrLine } from './types';

export type DateTimeResult = {
  readonly paidAt: Date | null;
  readonly time: { readonly hour: number; readonly minute: number } | null;
};

const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
const DAY_MONTH_YEAR = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,]+(\d{2}|\d{4})\b/i;
const MONTH_DAY_YEAR = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{2}|\d{4})\b/i;
const NUMERIC_DATE = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/;

function normalizeYear(year: string): number {
  const numeric = Number(year);
  return numeric < 100 ? numeric + 2_000 : numeric;
}

function dateFrom(text: string): Date | null {
  const dayMonthYear = DAY_MONTH_YEAR.exec(text);
  if (dayMonthYear) return new Date(normalizeYear(dayMonthYear[3]), MONTHS[dayMonthYear[2].toLowerCase()], Number(dayMonthYear[1]));
  const monthDayYear = MONTH_DAY_YEAR.exec(text);
  if (monthDayYear) return new Date(normalizeYear(monthDayYear[3]), MONTHS[monthDayYear[1].toLowerCase()], Number(monthDayYear[2]));
  const numeric = NUMERIC_DATE.exec(text);
  if (numeric) return new Date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1]));
  return null;
}

function timeFrom(lines: readonly OcrLine[], index: number): DateTimeResult['time'] {
  const text = lines[index].text;
  const meridiem = /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i.exec(text);
  if (meridiem) {
    let hour = Number(meridiem[1]) % 12;
    if (meridiem[3].toLowerCase() === 'pm') hour += 12;
    return { hour, minute: Number(meridiem[2]) };
  }
  const plain = /\b(\d{1,2}):(\d{2})\b/.exec(text);
  if (!plain) return null;
  const nearbyMeridiem = lines.find((line, otherIndex) => otherIndex !== index && Math.abs(line.box.y - lines[index].box.y) < 100 && /^\s*(am|pm)\s*$/i.test(line.text));
  let hour = Number(plain[1]) % 12;
  if (nearbyMeridiem && nearbyMeridiem.text.trim().toLowerCase() === 'pm') hour += 12;
  return { hour, minute: Number(plain[2]) };
}

export function extractDateTime(lines: readonly OcrLine[], referenceDate: Date): DateTimeResult {
  void referenceDate;
  let paidAt: Date | null = null;
  let time: DateTimeResult['time'] = null;
  for (let index = 0; index < lines.length; index += 1) {
    paidAt ??= dateFrom(lines[index].text);
    time ??= timeFrom(lines, index);
    if (paidAt && time) break;
  }
  return { paidAt, time };
}
