import { SunlightController } from './SunlightController';
import { Time, TimeScales } from '../utils/Time';

/* Controller to precompute aggegate in 3DTiles by hour, day or month  */
export class AggregateController extends SunlightController {
  constructor(config3DTiles) {
    super(config3DTiles);

    this.switchScale(TimeScales.Month);
  }

  /**
   * Get config3DTiles given an index of filtered config (by day or month).
   *
   * @param {int} configIndex
   * @returns {config3DTiles}
   */
  getConfigAt(configIndex) {
    return this.filteredConfig[configIndex];
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
   * Filter `config3DTiles` array to get only one 3DTiles by day.
   *
   * @returns {config3DTiles} an array of config3DTiles containing all aggregate.
   */
  filterConfigByDays() {
    const registeredDates = [];
    const output = [];
    this.config3DTiles.forEach((element) => {
      // Day already registered
      const currentDate = Time.extractDateAndHours(element.url);
      if (!currentDate || registeredDates.includes(currentDate.getDate())) {
        return;
      }
      registeredDates.push(currentDate.getDate());
      output.push(element);
    });

    return output;
  }

  /**
   * Filter `config3DTiles` array to get only one 3DTiles by month.
   *
   * @returns {config3DTiles} an array of config3DTiles containing all aggregate.
   */
  filterConfigByMonths() {
    const registeredDates = [];
    const output = [];

    this.config3DTiles.forEach((element) => {
      // Month already registered
      const currentDate = Time.extractDateAndHours(element.url);
      if (!currentDate || registeredDates.includes(currentDate.getMonth())) {
        return;
      }

      registeredDates.push(currentDate.getMonth());
      output.push(element);
    });

    return output;
  }
}
