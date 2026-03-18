import { format, parseISO, isToday, isYesterday, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Parse date from server - handles Unix timestamps (seconds/milliseconds) and ISO strings
 */
export function parseServerDate(date: string | number): Date {
  if (typeof date === 'number') {
    // If it's a Unix timestamp in seconds (before year 3000)
    if (date < 100000000000) {
      return new Date(date * 1000);
    }
    // Unix timestamp in milliseconds
    return new Date(date);
  }
  // ISO string
  return parseISO(date);
}

/**
 * Format date for display in Russian locale
 */
export function formatDate(date: Date | string | number, formatStr: string = 'd MMMM yyyy'): string {
  const parsedDate = typeof date === 'object' ? date : parseServerDate(date);
  return format(parsedDate, formatStr, { locale: ru });
}

/**
 * Format date with relative labels (Сегодня, Вчера, or full date)
 */
export function formatDateRelative(date: Date | string | number): string {
  const parsedDate = typeof date === 'object' ? date : parseServerDate(date);
  
  if (isToday(parsedDate)) {
    return 'Сегодня';
  }
  if (isYesterday(parsedDate)) {
    return 'Вчера';
  }
  return format(parsedDate, 'd MMMM', { locale: ru });
}

/**
 * Get date key for grouping (YYYY-MM-DD format in local timezone)
 */
export function getDateKey(date: Date | string | number): string {
  const parsedDate = typeof date === 'object' ? date : parseServerDate(date);
  return format(startOfDay(parsedDate), 'yyyy-MM-dd');
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string | number): string {
  const parsedDate = typeof date === 'object' ? date : parseServerDate(date);
  return format(parsedDate, 'HH:mm');
}

/**
 * Format date for API (ISO format)
 */
export function formatForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Format date for input[type="date"]
 */
export function formatForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse date from input[type="date"]
 */
export function parseFromInput(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Format date for datetime-local input
 */
export function formatForDateTimeInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
