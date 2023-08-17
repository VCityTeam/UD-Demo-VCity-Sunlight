import { SunlightController } from './SunlightController';
import { Time } from '../utils/Time';

/* Controller to precompute aggegate in 3DTiles by hour, day or month  */
export class AggregateController extends SunlightController {
  constructor(config3DTiles) {
    super(config3DTiles);

    this.filteredConfig = this.filterConfigByDays();
  }

  getConfigs() {
    return this.filteredConfig;
  }

  getConfigAt(configIndex) {
    return this.filteredConfig[configIndex];
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
    const config = this.getConfigs();
    const registeredDates = [];
    const output = [];

    config.forEach((element) => {
      // Day already registered
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
