/**
 * Countdown Utilities
 *
 * Calculate and format countdown timers for time capsules.
 */

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';

/**
 * Countdown breakdown
 */
export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

/**
 * Calculate countdown from now to target date
 */
export function getCountdown(targetDate: Date): Countdown {
  const now = new Date();
  const isExpired = now >= targetDate;

  if (isExpired) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
  }

  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;
  const seconds = differenceInSeconds(targetDate, now) % 60;
  const totalSeconds = differenceInSeconds(targetDate, now);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  };
}

/**
 * Calculate countdown between two dates
 */
export function getCountdownBetween(startDate: Date, targetDate: Date): Countdown {
  const isExpired = startDate >= targetDate;

  if (isExpired) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
  }

  const days = differenceInDays(targetDate, startDate);
  const hours = differenceInHours(targetDate, startDate) % 24;
  const minutes = differenceInMinutes(targetDate, startDate) % 60;
  const seconds = differenceInSeconds(targetDate, startDate) % 60;
  const totalSeconds = differenceInSeconds(targetDate, startDate);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  };
}

/**
 * Format countdown for display
 */
export function formatCountdown(countdown: Countdown): string {
  if (countdown.isExpired) {
    return 'Ready to open!';
  }

  const parts: string[] = [];

  if (countdown.days > 0) {
    parts.push(`${countdown.days} day${countdown.days !== 1 ? 's' : ''}`);
  }

  if (countdown.hours > 0 || countdown.days > 0) {
    parts.push(`${countdown.hours} hour${countdown.hours !== 1 ? 's' : ''}`);
  }

  parts.push(`${countdown.minutes} minute${countdown.minutes !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

/**
 * Format countdown as digital clock (DD:HH:MM:SS)
 */
export function formatCountdownDigital(countdown: Countdown): string {
  if (countdown.isExpired) {
    return '00:00:00:00';
  }

  const d = String(countdown.days).padStart(2, '0');
  const h = String(countdown.hours).padStart(2, '0');
  const m = String(countdown.minutes).padStart(2, '0');
  const s = String(countdown.seconds).padStart(2, '0');

  return `${d}:${h}:${m}:${s}`;
}

/**
 * Format countdown as short display
 */
export function formatCountdownShort(countdown: Countdown): string {
  if (countdown.isExpired) {
    return 'Now';
  }

  if (countdown.days > 0) {
    return `${countdown.days}d ${countdown.hours}h`;
  }

  if (countdown.hours > 0) {
    return `${countdown.hours}h ${countdown.minutes}m`;
  }

  return `${countdown.minutes}m ${countdown.seconds}s`;
}

/**
 * Calculate time percentage complete
 */
export function getTimeProgress(start: Date, end: Date, current: Date = new Date()): number {
  if (current <= start) return 0;
  if (current >= end) return 1;

  const total = end.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();

  return elapsed / total;
}

/**
 * Check if a capsule should be unlocked
 */
export function isCapsuleUnlocked(unlockAt: string): boolean {
  const unlockDate = new Date(unlockAt);
  const now = new Date();
  return now >= unlockDate;
}

/**
 * Get time until unlock as a human-readable string
 */
export function getTimeUntilUnlock(unlockAt: string): string {
  const countdown = getCountdown(new Date(unlockAt));
  return formatCountdown(countdown);
}
