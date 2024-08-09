import type { DatetimeLocalInputString, ISODate } from './types'

/**
 * Convert a date string a ISO format
 *
 * Defaults to now.
 *
 * `new Date` interprets the date as local time.
 * `toISOString` ensures dates are stored consistently.
 *
 * @param dateStr
 * @returns
 */
export function dateStrToISO(dateStr?: string): ISODate {
  const dateObj = dateStr ? new Date(dateStr) : new Date()
  return dateObj.toISOString()
}

export function isoToDatetimeLocalInputStr(isoDate: ISODate): DatetimeLocalInputString {
  return isoDate.slice(0, 16)
}
