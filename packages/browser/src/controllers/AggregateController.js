import { SunlightController } from './SunlightController';
import { Time, TimeScales } from '../utils/Time';

/* Controller to precompute aggegate in 3DTiles by hour, day or month  */
export class AggregateController extends SunlightController {
  constructor(sunlightConfig) {
    super(sunlightConfig);

    this.switchScale(TimeScales.Month);
  }

  /**
   * The function `switchScale` takes a `timeScale` parameter and based on its value, filters the
   * configuration either by days or by months.
   *
   * @param {TimeScales} timeScale - The time scale parameter is a value that determines the scale at which the data
   * should be filtered. It can be either "Day" or any other value.
   */
  switchScale(timeScale) {
    switch (timeScale) {
      case TimeScales.Day:
        this.filteredConfig = this.filterConfigByDays();
        break;

      default:
        this.filteredConfig = this.filterConfigByMonths();
        break;
    }

    this.timeScale = timeScale;
  }

  /**
   * Filter `sunlightConfig` array to get only one 3DTiles by day.
   *
   * @returns {object} an array of dates containing all aggregate.
   */
  filterConfigByDays() {
    const registeredDates = [];
    const dates = [];

    this.sunlightConfig.dates.forEach((element) => {
      // Day already registered
      const currentDate = Time.extractDateAndHours(element);
      if (!currentDate || registeredDates.includes(currentDate.getDate())) {
        return;
      }
      registeredDates.push(currentDate.getDate());
      dates.push(element);
    });

    const output = this.sunlightConfig;
    output.dates = dates;

    return output;
  }

  /**
   * Filter `sunlightConfig` array to get only one 3DTiles by month.
   *
   * @returns {object} an array of dates containing all aggregate.
   */
  filterConfigByMonths() {
    const registeredDates = [];
    const dates = [];

    this.sunlightConfig.dates.forEach((element) => {
      // Month already registered
      const currentDate = Time.extractDateAndHours(element.url);
      if (!currentDate || registeredDates.includes(currentDate.getMonth())) {
        return;
      }

      registeredDates.push(currentDate.getMonth());
      dates.push(element);
    });

    const output = this.sunlightConfig;
    output.dates = dates;

    return output;
  }
}
