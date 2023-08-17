/* The Time class provides methods to extract different components (day, month, and date) from a given
date string in the format "YYYY-MM-DD HHMM". */
export class Time {
  /**
   * Extract day from a date following "YYYY-MM-DD HHMM"
   *
   * @param rawDate
   * @returns {Date} Day number
   */
  static extractDateAndHours(rawDate) {
    // Sunlight date pattern following ISO 8601
    const DATE_PATTERN = /[0-9]{4}-[0-9]{2}-[0-9]{2}__[0-9]{4}/;

    // Do not follow the date ISO convention
    const result = rawDate.match(DATE_PATTERN);
    if (!result) {
      return null;
    }

    const date = result[0].replace('__', ' ');
    const year = date.split('-')[0];
    const month = date.split('-')[1];
    const day = date.split(' ')[0].split('-')[2];

    const hour = date.split(' ')[1].slice(0, 2);

    return new Date(year, month, day, hour);
  }

  /**
   * Format a date following to "HH DD-MM-YY"
   *
   * @param rawDate - The `rawDate` parameter is a string representing a date and time in a specific
   * format.
   * @returns {string} a formatted string that includes the hour and day extracted from the rawDate.
   */
  static formatForDisplay(rawDate) {
    const date = this.extractDateAndHours(rawDate);
    if (!date) {
      return null;
    }

    const localString = date.toLocaleString('fr-FR', {
      hour: 'numeric',
      day: '2-digit',
      year: '2-digit',
      month: '2-digit',
      hour12: false,
    });

    return localString.split(' ')[1] + ' H ' + localString.split(' ')[0];
  }
}
