// Date manipulation and formatting utilities using date-fns

import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatDistance,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInHours,
  differenceInMinutes,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  parseISO,
  isValid,
  closestTo,
  min,
  max,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getDay,
  getWeek,
  getMonth,
  getYear,
  setDay,
  setWeek,
  setMonth,
  setYear
} from 'date-fns';

// Common date formats
export const DATE_FORMATS = {
  SHORT_DATE: 'MM/dd/yyyy',
  LONG_DATE: 'MMMM dd, yyyy',
  ISO_DATE: 'yyyy-MM-dd',
  TIME_12: 'h:mm a',
  TIME_24: 'HH:mm',
  DATETIME_SHORT: 'MM/dd/yyyy h:mm a',
  DATETIME_LONG: 'MMMM dd, yyyy h:mm a',
  DATETIME_ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DAY_MONTH: 'MMM dd',
  MONTH_YEAR: 'MMMM yyyy',
  WEEKDAY: 'EEEE',
  WEEKDAY_SHORT: 'EEE',
} as const;

// Date creation utilities
export const createDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month - 1, day); // month is 0-indexed in JS Date
};

export const createDateTime = (
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date => {
  return new Date(year, month - 1, day, hour, minute, second);
};

export const parseDate = (dateString: string): Date | null => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const safeParse = (dateInput: string | Date): Date | null => {
  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : null;
  }
  
  if (typeof dateInput === 'string') {
    return parseDate(dateInput);
  }
  
  return null;
};

// Current date/time utilities
export const now = (): Date => new Date();
export const today = (): Date => startOfDay(new Date());
export const tomorrow = (): Date => addDays(today(), 1);
export const yesterday = (): Date => subDays(today(), 1);

// Date formatting utilities
export const formatDate = (date: Date | string, formatString: string = DATE_FORMATS.LONG_DATE): string => {
  const dateObj = safeParse(date);
  return dateObj ? format(dateObj, formatString) : 'Invalid Date';
};

export const formatDateShort = (date: Date | string): string => {
  const dateObj = safeParse(date);
  return dateObj ? format(dateObj, DATE_FORMATS.SHORT_DATE) : 'Invalid Date';
};

export const formatDateLong = (date: Date | string): string => {
  const dateObj = safeParse(date);
  return dateObj ? format(dateObj, DATE_FORMATS.LONG_DATE) : 'Invalid Date';
};

export const formatTime = (date: Date | string, format24Hour: boolean = false): string => {
  const dateObj = safeParse(date);
  if (!dateObj) return 'Invalid Time';
  
  return format(dateObj, format24Hour ? DATE_FORMATS.TIME_24 : DATE_FORMATS.TIME_12);
};

export const formatDateTime = (date: Date | string, format24Hour: boolean = false): string => {
  const dateObj = safeParse(date);
  if (!dateObj) return 'Invalid DateTime';
  
  return format(
    dateObj, 
    format24Hour ? DATE_FORMATS.DATETIME_LONG.replace('h:mm a', 'HH:mm') : DATE_FORMATS.DATETIME_LONG
  );
};

export const formatRelative = (date: Date | string): string => {
  const dateObj = safeParse(date);
  if (!dateObj) return 'Invalid Date';
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${formatTime(dateObj)}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  }
  
  if (isThisWeek(dateObj)) {
    return `${format(dateObj, 'EEEE')} at ${formatTime(dateObj)}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatRelativeStrict = (date: Date | string): string => {
  const dateObj = safeParse(date);
  if (!dateObj) return 'Invalid Date';
  
  return formatDistanceToNowStrict(dateObj, { addSuffix: true });
};

export const formatDuration = (startDate: Date | string, endDate: Date | string): string => {
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  
  if (!start || !end) return 'Invalid Duration';
  
  return formatDistance(start, end);
};

// Event-specific date formatting
export const formatEventDate = (startDate: Date | string, endDate: Date | string): string => {
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  
  if (!start || !end) return 'Invalid Event Date';
  
  // Same day event
  if (isSameDay(start, end)) {
    const dateStr = formatDateLong(start);
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    return `${dateStr}, ${startTime} - ${endTime}`;
  }
  
  // Multi-day event
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

export const formatEventDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  
  if (!start || !end) return 'Invalid Date Range';
  
  if (isSameDay(start, end)) {
    return formatDateLong(start);
  }
  
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`;
  }
  
  if (isSameYear(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  }
  
  return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
};

// Date comparison utilities
export const isDateBefore = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = safeParse(date);
  const compareObj = safeParse(compareDate);
  
  if (!dateObj || !compareObj) return false;
  
  return isBefore(dateObj, compareObj);
};

export const isDateAfter = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = safeParse(date);
  const compareObj = safeParse(compareDate);
  
  if (!dateObj || !compareObj) return false;
  
  return isAfter(dateObj, compareObj);
};

export const isDateEqual = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = safeParse(date);
  const compareObj = safeParse(compareDate);
  
  if (!dateObj || !compareObj) return false;
  
  return isEqual(dateObj, compareObj);
};

export const isSameDayAs = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = safeParse(date);
  const compareObj = safeParse(compareDate);
  
  if (!dateObj || !compareObj) return false;
  
  return isSameDay(dateObj, compareObj);
};

// Date range utilities
export const getDateRange = (start: Date, end: Date): Date[] => {
  return eachDayOfInterval({ start, end });
};

export const getWeekRange = (start: Date, end: Date): Date[] => {
  return eachWeekOfInterval({ start, end });
};

export const getMonthRange = (start: Date, end: Date): Date[] => {
  return eachMonthOfInterval({ start, end });
};

// Academic/business date utilities
export const getAcademicYear = (date: Date = new Date()): { start: Date; end: Date } => {
  const year = getYear(date);
  const month = getMonth(date); // 0-indexed
  
  // Academic year typically starts in August/September
  if (month >= 7) { // August or later
    return {
      start: createDate(year, 8, 1), // August 1st
      end: createDate(year + 1, 7, 31) // July 31st next year
    };
  } else {
    return {
      start: createDate(year - 1, 8, 1), // August 1st previous year
      end: createDate(year, 7, 31) // July 31st current year
    };
  }
};

export const getSemester = (date: Date = new Date()): 'fall' | 'spring' | 'summer' => {
  const month = getMonth(date); // 0-indexed
  
  if (month >= 7 && month <= 11) return 'fall'; // Aug-Dec
  if (month >= 0 && month <= 4) return 'spring'; // Jan-May
  return 'summer'; // Jun-Jul
};

// Calendar utilities
export const getCalendarWeeks = (date: Date): Date[][] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startWeek = startOfWeek(start);
  const endWeek = endOfWeek(end);
  
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });
  const weeks: Date[][] = [];
  
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return weeks;
};

export const getWeekdays = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const isWeekend = (date: Date): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isWeekday = (date: Date): boolean => {
  return !isWeekend(date);
};

export const getNextWeekday = (date: Date): Date => {
  let nextDay = addDays(date, 1);
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};

export const getPreviousWeekday = (date: Date): Date => {
  let prevDay = subDays(date, 1);
  while (isWeekend(prevDay)) {
    prevDay = subDays(prevDay, 1);
  }
  return prevDay;
};

// Event scheduling utilities
export const getEventStatus = (startDate: Date | string, endDate: Date | string): 'upcoming' | 'ongoing' | 'past' => {
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  const now = new Date();
  
  if (!start || !end) return 'past';
  
  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'past';
  return 'ongoing';
};

export const getTimeUntilEvent = (eventDate: Date | string): string => {
  const date = safeParse(eventDate);
  if (!date) return 'Invalid date';
  
  const now = new Date();
  
  if (isBefore(date, now)) {
    return 'Event has passed';
  }
  
  const days = differenceInDays(date, now);
  const hours = differenceInHours(date, now) % 24;
  const minutes = differenceInMinutes(date, now) % 60;
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

export const isRegistrationOpen = (
  registrationDeadline: Date | string | null,
  eventStartDate: Date | string
): boolean => {
  const now = new Date();
  const eventStart = safeParse(eventStartDate);
  
  if (!eventStart) return false;
  
  // If no deadline specified, use event start date
  const deadline = registrationDeadline ? safeParse(registrationDeadline) : eventStart;
  
  if (!deadline) return false;
  
  return isBefore(now, deadline);
};

// Date validation utilities
export const isValidDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = safeParse(startDate);
  const end = safeParse(endDate);
  
  if (!start || !end) return false;
  
  return isBefore(start, end) || isEqual(start, end);
};

export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = safeParse(date);
  if (!dateObj) return false;
  
  return isAfter(dateObj, new Date());
};

export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = safeParse(date);
  if (!dateObj) return false;
  
  return isBefore(dateObj, new Date());
};

// Date manipulation utilities
export const addTime = (date: Date, amount: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
  switch (unit) {
    case 'days': return addDays(date, amount);
    case 'weeks': return addWeeks(date, amount);
    case 'months': return addMonths(date, amount);
    case 'years': return addYears(date, amount);
    default: return date;
  }
};

export const subtractTime = (date: Date, amount: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date => {
  switch (unit) {
    case 'days': return subDays(date, amount);
    case 'weeks': return subWeeks(date, amount);
    case 'months': return subMonths(date, amount);
    case 'years': return subYears(date, amount);
    default: return date;
  }
};

export const setTimeToMidnight = (date: Date): Date => {
  return startOfDay(date);
};

export const setTimeToEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

export const combineDateTime = (date: Date, time: Date): Date => {
  return createDateTime(
    getYear(date),
    getMonth(date) + 1, // getMonth is 0-indexed
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds()
  );
};

// Time zone utilities (basic - for more complex timezone handling, use date-fns-tz)
export const getTimezoneOffset = (date: Date = new Date()): number => {
  return date.getTimezoneOffset();
};

export const getTimezoneOffsetString = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Age calculation utilities
export const calculateAge = (birthDate: Date | string): number => {
  const birth = safeParse(birthDate);
  if (!birth) return 0;
  
  return differenceInYears(new Date(), birth);
};

export const getAgeOnDate = (birthDate: Date | string, onDate: Date | string): number => {
  const birth = safeParse(birthDate);
  const date = safeParse(onDate);
  
  if (!birth || !date) return 0;
  
  return differenceInYears(date, birth);
};

// Statistics and analytics date utilities
export const getDateRangeStats = (dates: (Date | string)[]): {
  earliest: Date | null;
  latest: Date | null;
  span: number;
  count: number;
} => {
  const validDates = dates
    .map(d => safeParse(d))
    .filter((d): d is Date => d !== null);
  
  if (validDates.length === 0) {
    return { earliest: null, latest: null, span: 0, count: 0 };
  }
  
  const earliest = min(validDates);
  const latest = max(validDates);
  const span = differenceInDays(latest, earliest);
  
  return { earliest, latest, span, count: validDates.length };
};

export const groupDatesByPeriod = (
  dates: (Date | string)[],
  period: 'day' | 'week' | 'month' | 'year'
): Record<string, Date[]> => {
  const validDates = dates
    .map(d => safeParse(d))
    .filter((d): d is Date => d !== null);
  
  const grouped: Record<string, Date[]> = {};
  
  validDates.forEach(date => {
    let key: string;
    
    switch (period) {
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        key = format(startOfWeek(date), 'yyyy-MM-dd');
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      case 'year':
        key = format(date, 'yyyy');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(date);
  });
  
  return grouped;
};

// Recurring event utilities
export const generateRecurringDates = (
  startDate: Date,
  endDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  count?: number
): Date[] => {
  const dates: Date[] = [startDate];
  let currentDate = startDate;
  let iterations = 0;
  const maxIterations = count || 100; // Prevent infinite loops
  
  while (iterations < maxIterations && isBefore(currentDate, endDate)) {
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, 1);
        break;
    }
    
    if (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
      dates.push(currentDate);
    }
    
    iterations++;
  }
  
  return dates;
};

// Export all date utilities
export const dateUtils = {
  // Creation
  createDate,
  createDateTime,
  parseDate,
  safeParse,
  now,
  today,
  tomorrow,
  yesterday,
  
  // Formatting
  formatDateShort,
  formatDateLong,
  formatTime,
  formatDateTime,
  formatRelative,
  formatRelativeStrict,
  formatDuration,
  formatEventDate,
  formatEventDateRange,
  
  // Comparison
  isDateBefore,
  isDateAfter,
  isDateEqual,
  isSameDayAs,
  
  // Ranges
  getDateRange,
  getWeekRange,
  getMonthRange,
  
  // Academic/Business
  getAcademicYear,
  getSemester,
  
  // Calendar
  getCalendarWeeks,
  getWeekdays,
  isWeekend,
  isWeekday,
  getNextWeekday,
  getPreviousWeekday,
  
  // Events
  getEventStatus,
  getTimeUntilEvent,
  isRegistrationOpen,
  
  // Validation
  isValidDateRange,
  isDateInFuture,
  isDateInPast,
  
  // Manipulation
  addTime,
  subtractTime,
  setTimeToMidnight,
  setTimeToEndOfDay,
  combineDateTime,
  
  // Timezone
  getTimezoneOffset,
  getTimezoneOffsetString,
  
  // Age
  calculateAge,
  getAgeOnDate,
  
  // Statistics
  getDateRangeStats,
  groupDatesByPeriod,
  
  // Recurring
  generateRecurringDates,
  
  // Constants
  DATE_FORMATS
};