/**
 * Ethiopian Calendar utilities
 *
 * Based on the Ethiopic calendar system:
 * - 12 months of 30 days each
 * - 1 month of 5 days (6 in a leap year)
 * - Leap year every 4 years (when year % 4 === 3)
 */

export interface EthiopicDate {
  year: number;
  month: number; // 1-13
  day: number;
}

const ETHIOPIC_EPOCH = 1723856;

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC off-by-one). */
export function parseIsoDateLocal(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Format a local Gregorian date as YYYY-MM-DD. */
export function formatGregorianIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function getDaysInEthiopianMonth(year: number, month: number): number {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 0;
}

/** Converts Gregorian date to Ethiopic date (uses local Y-M-D). */
export function toEthiopic(date: Date): EthiopicDate {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdnToEthiopic(jdn);
}

/** Converts Ethiopic date to Gregorian date. */
export function toGregorian(year: number, month: number, day: number): Date {
  const jdn = ethiopicToJdn(year, month, day);
  const { y, m, d } = jdnToGregorian(jdn);
  return new Date(y, m - 1, d);
}

/** Converts ISO YYYY-MM-DD to Ethiopic date. */
export function isoToEthiopic(iso: string): EthiopicDate | null {
  const date = parseIsoDateLocal(iso);
  if (!date) return null;
  return toEthiopic(date);
}

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { y: number; m: number; d: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((b * 146097) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return { y: year, m: month, d: day };
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

function ethiopicToJdn(year: number, month: number, day: number): number {
  // PHP calendar extension formula (equivalent epoch, correct month indexing)
  return (
    ETHIOPIC_EPOCH +
    365 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * month +
    day -
    31
  );
}

function jdnToEthiopic(jdn: number): EthiopicDate {
  const r = mod(jdn - ETHIOPIC_EPOCH, 1461);
  const n = mod(r % 365, 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - ETHIOPIC_EPOCH) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export const AT_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehasse', 'Pagume',
];

export const AT_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];
