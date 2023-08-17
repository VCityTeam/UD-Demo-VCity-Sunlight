/* TimeScale supported by the application */
export const TimeScales = {
  Hour: 0,
  Day: 1,
  Month: 2,
};

/* The Time class provides methods to convert Sunlight date to JS Date and 
centralize date format for display */
export class Time {
  /**
   * Extract day from a date following "YYYY-MM-DD HHMM"
   *
   * @param {string} rawDate - Date containing
   * @returns {Date} Day number
   */
  static extractDateAndHours(rawDate) {
    // Sunlight date pattern following ISO 8601
    const DATE_PATTERN = /[0-9]{4}-[0-9]{2}-[0-9]{2}__[0-9]{4}/;

    // Do not follow the date ISO convention
    const result = rawDate.match(DATE_PATTERN);
    if (!result) {
      console.warn(
        `Date ${rawDate} does not follow the expected format "YYYY-MM-DD__HHMM" :`
      );
      return null;
    }

    // Extract all value from the raw date
    const date = result[0].replace('__', ' ');
    const year = date.split('-')[0];
    const month = date.split('-')[1];
    const day = date.split(' ')[0].split('-')[2];
    const hour = date.split(' ')[1].slice(0, 2);

    return new Date(year, month, day, hour);
  }

  /**
   * Get string represention of a given date depending on the timescale wanted.
   *
   * @param {Date} date - The `date` parameter is a JavaScript `Date` object that represents a specific date
   * and time.
   * @param {TimeScales} timeScale - Time scale wanted on the string result.
   * @returns {string} a string that represents the full date and times
   */
  static getDisplayFor(date, timeScale = TimeScales.Hour) {
    switch (timeScale) {
      case TimeScales.Day:
        return Time.getDateString(date);

      case TimeScales.Month:
        return Time.getMonthYearString(date);

      default:
        return Time.getFullDatesString(date);
    }
  }

  /**
   * The function `getFullDatesString` takes a date object and returns a formatted string representing
   * the date and time in the format "H dd/mm/yy".
   *
   * @param {Date} date - The `date` parameter is a JavaScript `Date` object that represents a specific date
   * and time.
   * @returns {string} a string that represents the full date and time in the format "H dd/mm/yy".
   */
  static getFullDatesString(date) {
    const localString = date.toLocaleString('fr-FR', {
      hour: 'numeric',
      day: '2-digit',
      year: '2-digit',
      month: '2-digit',
      hour12: false,
    });

    return localString.split(' ')[1] + ' H ' + localString.split(' ')[0];
  }

  /**
   * The function `getDateString` returns a formatted date string in the format "MM/DD/YY".
   *
   * @param {Date} date - The `date` parameter is the date object that you want to convert to a formatted
   * string.
   * @returns {string} a formatted date string in the format "MM/DD/YY".
   */
  static getDateString(date) {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      year: '2-digit',
      month: '2-digit',
    });
  }

  /**
   * The function `getMonthYearString` takes a date object and returns a string representation of the
   * month and year in a short format.
   *
   * @param {Date} date - The `date` parameter is a JavaScript `Date` object that represents a specific date
   * and time.
   * @returns {string} a string representation of the month and year of the given date.
   */
  static getMonthYearString(date) {
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleString('fr-FR', options);
  }
}
