/**
 * Calendar Utilities
 *
 * Helper functions for calendar view and date operations.
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

/**
 * Get the user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get date key (YYYY-MM-DD) from a date
 * Uses the user's local timezone
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date key from ISO string
 */
export function getDateKeyFromISO(isoString: string): string {
  const date = parseISO(isoString);
  return getDateKey(date);
}

/**
 * Get month range for querying moments
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Get calendar data for a month
 * Returns an array of days including padding days from previous/next months
 */
export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
}

export function getMonthData(year: number, month: number, startDayOfWeek: 0 | 1 | 6 = 0): CalendarDay[][] {
  const date = new Date(year, month, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: startDayOfWeek });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: startDayOfWeek });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const calendarDays: CalendarDay[] = days.map((day) => ({
    date: day,
    dateKey: getDateKey(day),
    isCurrentMonth: isSameMonth(day, date),
    isToday: isSameDay(day, today),
    dayOfMonth: day.getDate(),
  }));

  // Split into weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Group moments by date key
 */
export interface MomentGroup {
  dateKey: string;
  date: Date;
  moments: any[]; // Will be typed with MomentDocument when used
}

export function groupMomentsByDateKey(moments: Array<{ dateKey: string; dateTaken: string }>): MomentGroup[] {
  const grouped = new Map<string, MomentGroup>();

  moments.forEach((moment) => {
    const existing = grouped.get(moment.dateKey);

    if (existing) {
      existing.moments.push(moment);
    } else {
      grouped.set(moment.dateKey, {
        dateKey: moment.dateKey,
        date: new Date(moment.dateTaken),
        moments: [moment],
      });
    }
  });

  // Sort by date descending
  return Array.from(grouped.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Get months with moment data
 */
export interface MonthWithMoments {
  year: number;
  month: number;
  monthName: string;
  momentCount: number;
}

export function getMonthsWithMoments(moments: Array<{ dateKey: string }>): MonthWithMoments[] {
  const monthCounts = new Map<string, number>();

  moments.forEach((moment) => {
    const date = parseISO(moment.dateKey);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
  });

  return Array.from(monthCounts.entries())
    .map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month, 1);
      return {
        year,
        month,
        monthName: format(date, 'MMMM yyyy'),
        momentCount: count,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
}

/**
 * Navigate to next month
 */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  const date = addMonths(new Date(year, month, 1), 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * Navigate to previous month
 */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  const date = subMonths(new Date(year, month, 1), 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Format date with day of week
 */
export function formatDisplayDateWithDay(date: Date): string {
  return format(date, 'EEEE, MMM d, yyyy');
}

/**
 * Parse date key to Date object
 * Note: This uses local time (midnight)
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}
