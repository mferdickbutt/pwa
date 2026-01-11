/**
 * Age Calculation Utilities
 *
 * Calculates accurate age based on date of birth and a given date.
 * Format changes based on age: < 24 months shows months + days, >= 24 months shows years + months.
 */

import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } from 'date-fns';

/**
 * Age representation
 */
export interface Age {
  years: number;
  months: number;
  days: number;
}

/**
 * Calculate age between two dates
 */
export function calculateAge(dob: Date, dateTaken: Date): Age {
  // Ensure dateTaken is after dob
  if (dateTaken < dob) {
    return { years: 0, months: 0, days: 0 };
  }

  const years = differenceInYears(dateTaken, dob);
  const dateAfterYears = addYears(dob, years);
  const months = differenceInMonths(dateTaken, dateAfterYears);
  const dateAfterMonths = addMonths(dateAfterYears, months);
  const days = differenceInDays(dateTaken, dateAfterMonths);

  return { years, months, days };
}

/**
 * Calculate total age in months (for growth charts)
 */
export function calculateAgeInMonths(dob: Date, dateTaken: Date): number {
  const years = differenceInYears(dateTaken, dob);
  const dateAfterYears = addYears(dob, years);
  const months = differenceInMonths(dateTaken, dateAfterYears);

  return years * 12 + months;
}

/**
 * Format age for display
 * - < 24 months: "X months Y days"
 * - >= 24 months: "X years Y months"
 */
export function formatAge(age: Age): string {
  const totalMonths = age.years * 12 + age.months;

  if (totalMonths < 24) {
    // Show months and days for babies under 2 years
    if (age.months === 0) {
      return `${age.days} day${age.days !== 1 ? 's' : ''}`;
    }
    if (age.days === 0) {
      return `${age.months} month${age.months !== 1 ? 's' : ''}`;
    }
    return `${age.months} month${age.months !== 1 ? 's' : ''} ${age.days} day${age.days !== 1 ? 's' : ''}`;
  }

  // Show years and months for older children
  if (age.months === 0) {
    return `${age.years} year${age.years !== 1 ? 's' : ''}`;
  }
  return `${age.years} year${age.years !== 1 ? 's' : ''} ${age.months} month${age.months !== 1 ? 's' : ''}`;
}

/**
 * Format age from dates (convenience function)
 */
export function formatAgeFromDate(dob: Date, dateTaken: Date): string {
  const age = calculateAge(dob, dateTaken);
  return formatAge(age);
}

/**
 * Get current age (uses today's date)
 */
export function getCurrentAge(dob: Date): string {
  return formatAgeFromDate(dob, new Date());
}

/**
 * Calculate age for display on a moment
 * This is the primary function used throughout the app
 */
export function calculateMomentAge(dobString: string, dateTakenString: string): string {
  const dob = new Date(dobString);
  const dateTaken = new Date(dateTakenString);

  return formatAgeFromDate(dob, dateTaken);
}

/**
 * Check if a date is before the date of birth
 */
export function isBeforeDob(dateTaken: Date, dob: Date): boolean {
  return dateTaken < dob;
}

/**
 * Calculate adjusted age for premature babies
 * (optional enhancement for future use)
 */
export function calculateAdjustedAge(
  dob: Date,
  dateTaken: Date,
  dueDate?: Date
): Age | null {
  // If no due date provided, return actual age
  if (!dueDate) {
    return calculateAge(dob, dateTaken);
  }

  // If due date is after birth date, baby was premature
  if (dueDate > dob) {
    const weeksPremature = Math.floor((dueDate.getTime() - dob.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Only adjust if significantly premature (> 2 weeks)
    if (weeksPremature > 2) {
      // Use due date as the adjusted birth date
      return calculateAge(dueDate, dateTaken);
    }
  }

  return calculateAge(dob, dateTaken);
}
