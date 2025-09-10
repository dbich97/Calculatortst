
import type { Age, TimeDuration } from '../types';

export function calculateAge(birthDate: Date): Age {
  const today = new Date();
  const birth = new Date(birthDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Get the last day of the previous month
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayOfPreviousMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Calculates the season for a given date (Northern Hemisphere).
 * @param date - The date.
 * @returns Season index (0: Winter, 1: Spring, 2: Summer, 3: Autumn).
 */
export function getSeason(date: Date): number {
  const month = date.getMonth();
  const day = date.getDate();

  // Astrological season start dates
  if ((month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20)) {
    return 0; // Winter
  } else if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
    return 1; // Spring
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22)) {
    return 2; // Summer
  } else {
    return 3; // Autumn
  }
}

/**
 * Calculates the number of days until the next birthday.
 * @param birthDate - The date of birth.
 * @returns The number of days until the next birthday.
 */
export function calculateNextBirthdayCountdown(birthDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  const currentYear = today.getFullYear();

  let nextBirthday = new Date(currentYear, birthMonth, birthDay);

  if (nextBirthday.getTime() === today.getTime()) {
    return 0;
  }
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const oneDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / oneDay);
  
  return diffDays;
}


/**
 * Gets the current Hijri year using the Intl API.
 * @returns The current Hijri year as a number.
 */
export function getCurrentHijriYear(): number {
    try {
        const hijriYearStr = new Intl.DateTimeFormat('en-u-ca-islamic', { year: 'numeric' }).format(new Date());
        return parseInt(hijriYearStr.split(' ')[0], 10);
    } catch(e) {
        // Fallback for older environments
        const gregorianYear = new Date().getFullYear();
        return Math.floor((gregorianYear - 622) * 1.0307) + 1;
    }
}

/**
 * Gets the current Solar Hijri (Persian) year.
 * @returns The current Solar Hijri year as a number.
 */
export function getCurrentSolarHijriYear(): number {
    try {
        // Use fa-IR locale which uses the Solar Hijri calendar. Use -u-nu-latn to ensure latin numbers.
        const solarHijriYearStr = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric' }).format(new Date());
        return parseInt(solarHijriYearStr, 10);
    } catch (e) {
        // Fallback for older environments
        const gregorianYear = new Date().getFullYear();
        const gregorianMonth = new Date().getMonth(); // 0-11
        const gregorianDay = new Date().getDate();
        // Persian new year is around March 21
        if (gregorianMonth < 2 || (gregorianMonth === 2 && gregorianDay < 21)) {
            return gregorianYear - 622;
        }
        return gregorianYear - 621;
    }
}


/**
 * Converts a Hijri date to a Gregorian date.
 * This is an approximation and may have a small margin of error.
 * @param hy - Hijri year
 * @param hm - Hijri month
 * @param hd - Hijri day
 * @returns A Gregorian Date object.
 */
export function hijriToGregorian(hy: number, hm: number, hd: number): Date {
    const jd = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm - Math.floor((hm - 1) / 2) + hd + 1948440 - 385;
    let l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const day = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const month = j + 2 - 12 * l;
    const year = 100 * (n - 49) + i + l;
    return new Date(year, month - 1, day);
}

/**
 * Converts a Solar Hijri (Jalali/Persian) date to a Gregorian date.
 * @param sy - Solar Hijri year
 * @param sm - Solar Hijri month
 * @param sd - Solar Hijri day
 * @returns A Gregorian Date object.
 */
export function solarHijriToGregorian(sy: number, sm: number, sd: number): Date {
    const PERSIAN_EPOCH = 1948320.5;

    // Calculate days passed since the start of the Solar Hijri year
    let daysPassed;
    if (sm <= 6) {
        daysPassed = (sm - 1) * 31;
    } else {
        daysPassed = (6 * 31) + (sm - 7) * 30;
    }
    daysPassed += sd;

    // Calculate Julian Day Number
    const yearInEra = sy > 0 ? sy - 1 : sy;
    const julianDay = PERSIAN_EPOCH - 1 + 365 * yearInEra + Math.floor((8 * yearInEra + 21) / 33) + daysPassed;

    // Convert Julian Day to milliseconds since Unix epoch
    // 2440587.5 is the Julian Day of the Unix epoch
    const milliseconds = (julianDay - 2440587.5) * 86400000;

    return new Date(milliseconds);
}

/**
 * Converts a TimeDuration object to total seconds.
 * @param duration - The TimeDuration object.
 * @returns The total number of seconds.
 */
export function durationToSeconds(duration: TimeDuration): number {
  return (
    duration.days * 24 * 60 * 60 +
    duration.hours * 60 * 60 +
    duration.minutes * 60 +
    duration.seconds
  );
}

/**
 * Converts total seconds to a TimeDuration object.
 * @param totalSeconds - The total number of seconds.
 * @returns A TimeDuration object.
 */
export function secondsToDuration(totalSeconds: number): TimeDuration {
  const safeTotalSeconds = Math.abs(totalSeconds);
  const days = Math.floor(safeTotalSeconds / (24 * 60 * 60));
  let remainder = safeTotalSeconds % (24 * 60 * 60);

  const hours = Math.floor(remainder / (60 * 60));
  remainder %= (60 * 60);

  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;

  return { days, hours, minutes, seconds };
}


/**
 * Adds or subtracts two TimeDuration objects.
 * @param time1 - The first TimeDuration object.
 * @param time2 - The second TimeDuration object.
 * @param operation - The operation to perform ('add' or 'subtract').
 * @returns The resulting TimeDuration object, or null if subtraction results in negative time.
 */
export function calculateTime(
  time1: TimeDuration,
  time2: TimeDuration,
  operation: 'add' | 'subtract'
): TimeDuration | null {
  const seconds1 = durationToSeconds(time1);
  const seconds2 = durationToSeconds(time2);

  let resultSeconds: number;
  if (operation === 'add') {
    resultSeconds = seconds1 + seconds2;
  } else {
    resultSeconds = seconds1 - seconds2;
    if (resultSeconds < 0) {
      return null; // Negative time is handled as an error condition
    }
  }

  return secondsToDuration(resultSeconds);
}
