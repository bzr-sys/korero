import type { DatetimeLocalInputString } from './types'

export function dateObjToDatetimeLocalFormat(date = new Date()): DatetimeLocalInputString {
  return date.toISOString().slice(0, 16)
}
