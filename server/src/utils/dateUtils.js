/**
 * dateUtils.js
 * Centralized date and time utilities for the BookMyVenue booking engine.
 *
 * MVP Assumption: All venues operate in Asia/Kolkata (IST, UTC+5:30).
 * Functions are named generically to support multi-timezone in a future phase
 * by replacing the internals without changing call sites.
 */

const VENUE_TIMEZONE = 'Asia/Kolkata';
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Returns the current date/time as a Date object expressed in the venue timezone.
 * Uses Intl to determine the correct local time even when the server is UTC.
 */
const getNowInVenueTz = () => {
  // Intl.DateTimeFormat gives us the current moment broken into local parts.
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VENUE_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type) => parseInt(parts.find(p => p.type === type).value, 10);

  // Construct a Date object at the local venue time (treated as if it's UTC midnight for comparison purposes)
  return {
    year: get('year'),
    month: get('month'),   // 1-indexed
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
};

// ─── Exported Utilities ────────────────────────────────────────────────────────

/**
 * Returns today's date string in YYYY-MM-DD format in the venue timezone.
 */
export const getTodayString = () => {
  const { year, month, day } = getNowInVenueTz();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Returns the current time as minutes since midnight in the venue timezone.
 * Used for real-time slot cutoff calculations.
 */
export const getNowMinutes = () => {
  const { hour, minute } = getNowInVenueTz();
  return hour * 60 + minute;
};

/**
 * Parses a YYYY-MM-DD date string into a comparable integer (YYYYMMDD) in the
 * venue timezone. Avoids UTC midnight shift bugs from `new Date("YYYY-MM-DD")`.
 */
export const parseDateToInt = (dateStr) => {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  return y * 10000 + m * 100 + d;
};

/**
 * Returns true if dateStr is strictly before today in the venue timezone.
 */
export const isPastDate = (dateStr) => {
  return parseDateToInt(dateStr) < parseDateToInt(getTodayString());
};

/**
 * Returns true if dateStr is today or before today in the venue timezone.
 */
export const isTodayOrPastDate = (dateStr) => {
  return parseDateToInt(dateStr) <= parseDateToInt(getTodayString());
};

/**
 * Returns the number of days between two YYYY-MM-DD strings.
 * E.g., daysBetween('2026-07-27', '2026-07-28') returns 1.
 */
export const daysBetween = (startStr, endStr) => {
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  return Math.round((end - start) / (1000 * 3600 * 24));
};

/**
 * Returns the day-of-week name ('monday', 'tuesday', ...) for a YYYY-MM-DD date
 * string, evaluated in the venue timezone to avoid Sunday/Monday boundary errors.
 */
export const getDayOfWeek = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Using Date.UTC keeps the day correct independent of server TZ.
  // new Date(y, m-1, d) would use server local time and shift at midnight.
  const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  // getUTCDay() for a UTC noon date gives the correct day regardless of server TZ.
  return DAYS_OF_WEEK[date.getUTCDay()];
};

/**
 * Parses "HH:MM" into minutes since midnight.
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Formats minutes since midnight into "HH:MM".
 */
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Logs a startup warning if the server timezone is not Asia/Kolkata.
 * Does not throw — this is an operational warning, not a hard error.
 * Call once during server startup.
 */
export const warnIfTimezoneNotVenueTz = () => {
  const serverTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (serverTz !== VENUE_TIMEZONE) {
    console.warn(
      `\n⚠️  TIMEZONE WARNING: Server timezone is "${serverTz}".\n` +
      `   This MVP assumes all venues operate in "${VENUE_TIMEZONE}".\n` +
      `   Date calculations may be incorrect on this server.\n` +
      `   Set TZ=${VENUE_TIMEZONE} in your environment.\n`
    );
  }
};
