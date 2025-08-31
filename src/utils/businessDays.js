/**
 * Business Days Utility
 * Handles weekday-only streaks (Monday-Friday) and US Federal Holidays
 */

// US Federal Holidays (using observed dates when they fall on weekends)
// These are the standard federal holidays
function getUSFederalHolidays(year) {
  const holidays = []
  
  // New Year's Day - January 1 (or observed)
  let newYears = new Date(year, 0, 1)
  if (newYears.getDay() === 0) newYears = new Date(year, 0, 2) // Sunday -> Monday
  if (newYears.getDay() === 6) newYears = new Date(year - 1, 11, 31) // Saturday -> Friday
  holidays.push(newYears)
  
  // Martin Luther King Jr. Day - Third Monday in January
  const mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3)
  holidays.push(mlkDay)
  
  // Presidents' Day - Third Monday in February
  const presidentsDay = getNthWeekdayOfMonth(year, 1, 1, 3)
  holidays.push(presidentsDay)
  
  // Memorial Day - Last Monday in May
  const memorialDay = getLastWeekdayOfMonth(year, 4, 1)
  holidays.push(memorialDay)
  
  // Juneteenth - June 19 (or observed)
  let juneteenth = new Date(year, 5, 19)
  if (juneteenth.getDay() === 0) juneteenth = new Date(year, 5, 20) // Sunday -> Monday
  if (juneteenth.getDay() === 6) juneteenth = new Date(year, 5, 18) // Saturday -> Friday
  holidays.push(juneteenth)
  
  // Independence Day - July 4 (or observed)
  let july4 = new Date(year, 6, 4)
  if (july4.getDay() === 0) july4 = new Date(year, 6, 5) // Sunday -> Monday
  if (july4.getDay() === 6) july4 = new Date(year, 6, 3) // Saturday -> Friday
  holidays.push(july4)
  
  // Labor Day - First Monday in September
  const laborDay = getNthWeekdayOfMonth(year, 8, 1, 1)
  holidays.push(laborDay)
  
  // Columbus Day - Second Monday in October
  const columbusDay = getNthWeekdayOfMonth(year, 9, 1, 2)
  holidays.push(columbusDay)
  
  // Veterans Day - November 11 (or observed)
  let veteransDay = new Date(year, 10, 11)
  if (veteransDay.getDay() === 0) veteransDay = new Date(year, 10, 12) // Sunday -> Monday
  if (veteransDay.getDay() === 6) veteransDay = new Date(year, 10, 10) // Saturday -> Friday
  holidays.push(veteransDay)
  
  // Thanksgiving Day - Fourth Thursday in November
  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4)
  holidays.push(thanksgiving)
  
  // Christmas Day - December 25 (or observed)
  let christmas = new Date(year, 11, 25)
  if (christmas.getDay() === 0) christmas = new Date(year, 11, 26) // Sunday -> Monday
  if (christmas.getDay() === 6) christmas = new Date(year, 11, 24) // Saturday -> Friday
  holidays.push(christmas)
  
  return holidays
}

// Helper function to get Nth weekday of month
function getNthWeekdayOfMonth(year, month, dayOfWeek, n) {
  const firstDay = new Date(year, month, 1)
  let dayOffset = dayOfWeek - firstDay.getDay()
  if (dayOffset < 0) dayOffset += 7
  return new Date(year, month, 1 + dayOffset + (n - 1) * 7)
}

// Helper function to get last weekday of month
function getLastWeekdayOfMonth(year, month, dayOfWeek) {
  const lastDay = new Date(year, month + 1, 0)
  let dayOffset = lastDay.getDay() - dayOfWeek
  if (dayOffset < 0) dayOffset += 7
  return new Date(year, month + 1, -dayOffset)
}

// Check if a date is a US Federal Holiday
export function isUSFederalHoliday(date) {
  const year = date.getFullYear()
  const holidays = getUSFederalHolidays(year)
  
  return holidays.some(holiday => 
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  )
}

// Check if a date is a business day (Monday-Friday, not a federal holiday)
export function isBusinessDay(date) {
  const dayOfWeek = date.getDay()
  
  // Check if it's a weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }
  
  // Check if it's a federal holiday
  if (isUSFederalHoliday(date)) {
    return false
  }
  
  return true
}

// Get the previous business day
export function getPreviousBusinessDay(date) {
  const prevDate = new Date(date)
  prevDate.setDate(prevDate.getDate() - 1)
  
  while (!isBusinessDay(prevDate)) {
    prevDate.setDate(prevDate.getDate() - 1)
  }
  
  return prevDate
}

// Get the next business day
export function getNextBusinessDay(date) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + 1)
  
  while (!isBusinessDay(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1)
  }
  
  return nextDate
}

// Calculate if a streak is still active based on business days
export function isStreakActive(lastActivityDate) {
  if (!lastActivityDate) return false
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastActivity = new Date(lastActivityDate)
  lastActivity.setHours(0, 0, 0, 0)
  
  // If last activity was today, streak is active
  if (lastActivity.getTime() === today.getTime()) {
    return true
  }
  
  // Check if today is a business day
  if (!isBusinessDay(today)) {
    // If today is not a business day, check the last business day
    const lastBusinessDay = getPreviousBusinessDay(today)
    return lastActivity.getTime() >= lastBusinessDay.getTime()
  }
  
  // If today is a business day, check if last activity was on the previous business day
  const previousBusinessDay = getPreviousBusinessDay(today)
  return lastActivity.getTime() === previousBusinessDay.getTime()
}

// Calculate the number of business days between two dates
export function countBusinessDaysBetween(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  while (current <= end) {
    if (isBusinessDay(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

// Get holiday name for a given date
export function getHolidayName(date) {
  const month = date.getMonth()
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const year = date.getFullYear()
  
  // Check New Year's Day
  if (month === 0 && day === 1) return "New Year's Day"
  if (month === 0 && day === 2 && dayOfWeek === 1) return "New Year's Day (Observed)"
  if (month === 11 && day === 31 && dayOfWeek === 5) return "New Year's Day (Observed)"
  
  // Check MLK Day (3rd Monday in January)
  if (month === 0 && dayOfWeek === 1 && day >= 15 && day <= 21) {
    return "Martin Luther King Jr. Day"
  }
  
  // Check Presidents' Day (3rd Monday in February)
  if (month === 1 && dayOfWeek === 1 && day >= 15 && day <= 21) {
    return "Presidents' Day"
  }
  
  // Check Memorial Day (Last Monday in May)
  if (month === 4 && dayOfWeek === 1 && day >= 25) {
    return "Memorial Day"
  }
  
  // Check Juneteenth
  if (month === 5 && day === 19) return "Juneteenth"
  if (month === 5 && day === 18 && dayOfWeek === 5) return "Juneteenth (Observed)"
  if (month === 5 && day === 20 && dayOfWeek === 1) return "Juneteenth (Observed)"
  
  // Check Independence Day
  if (month === 6 && day === 4) return "Independence Day"
  if (month === 6 && day === 3 && dayOfWeek === 5) return "Independence Day (Observed)"
  if (month === 6 && day === 5 && dayOfWeek === 1) return "Independence Day (Observed)"
  
  // Check Labor Day (1st Monday in September)
  if (month === 8 && dayOfWeek === 1 && day <= 7) {
    return "Labor Day"
  }
  
  // Check Columbus Day (2nd Monday in October)
  if (month === 9 && dayOfWeek === 1 && day >= 8 && day <= 14) {
    return "Columbus Day"
  }
  
  // Check Veterans Day
  if (month === 10 && day === 11) return "Veterans Day"
  if (month === 10 && day === 10 && dayOfWeek === 5) return "Veterans Day (Observed)"
  if (month === 10 && day === 12 && dayOfWeek === 1) return "Veterans Day (Observed)"
  
  // Check Thanksgiving (4th Thursday in November)
  if (month === 10 && dayOfWeek === 4 && day >= 22 && day <= 28) {
    return "Thanksgiving Day"
  }
  
  // Check Christmas
  if (month === 11 && day === 25) return "Christmas Day"
  if (month === 11 && day === 24 && dayOfWeek === 5) return "Christmas Day (Observed)"
  if (month === 11 && day === 26 && dayOfWeek === 1) return "Christmas Day (Observed)"
  
  return null
}

export const BusinessDaysUtils = {
  isUSFederalHoliday,
  isBusinessDay,
  getPreviousBusinessDay,
  getNextBusinessDay,
  isStreakActive,
  countBusinessDaysBetween,
  getHolidayName
}
export default BusinessDaysUtils