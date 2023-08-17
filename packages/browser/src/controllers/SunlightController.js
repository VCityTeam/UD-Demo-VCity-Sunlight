import { itowns } from '@ud-viz/browser';
import { Time } from '../utils/Time';

/* Controller to display light and shadow by hour */
export class SunlightController {
  constructor(config3DTiles) {
    this.config3DTiles = config3DTiles;
  }

  /**
   * Get style affecting feature based on Sunlight result (in light : yellow, in shadow : black).
   *
   * @returns {itowns.Style} The code is returning a new instance of the `itowns.Style` class.
   */
  getStyle() {
    return new itowns.Style({
      fill: {
        color: function (feature) {
          if (feature.getInfo().batchTable.bLighted) return 'yellow';

          return 'black';
        },
      },
    });
  }

  /**
   * The getConfigs function returns the value of the config3DTiles property.
   *
   * @returns {config3DTiles} The function `getConfigs()` is returning the value of `this.config3DTiles`.
   */
  getConfigs() {
    return this.config3DTiles;
  }

  /**
   * The getConfigs function return a config3DTiles given an index.
   *
   * @param {int} index - Config index.
   * @returns {config3DTiles} - Config3DTiles at a given idnex.
   */
  getConfigAt(index) {
    return this.config3DTiles[index];
  }

  /**
   * The function `getDisplayedDates` extracts dates from URLs in `config3DTiles` and formats them for
   * display.
   *
   * @returns {Array.<string>} an array of formatted dates.
   */
  getDisplayedDates() {
    const dates = [];

    this.config3DTiles.forEach((element) => {
      // Check if we can use the date in url
      const date = Time.extractDateAndHours(element.url);
      if (!date) {
        return;
      }

      const formatedDate = Time.formatForDisplay(date);
      dates.push(formatedDate);
    });

    return dates;
  }
}
