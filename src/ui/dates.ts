import type { CalendarDate } from '../domain/calendarDate';

/** Today's date in the device's own time zone. */
export function todayCalendarDate(now: Date = new Date()): CalendarDate {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${String(now.getFullYear())}-${month}-${day}`;
}
