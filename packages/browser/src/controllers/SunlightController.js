import { itowns } from '@ud-viz/browser';
import { Time, TimeScales } from '../utils/Time';

/* Controller to display light and shadow by hour */
export class SunlightController {
  constructor(config3DTiles) {
    this.config3DTiles = config3DTiles;
    this.filteredConfig = config3DTiles;
    this.timeScale = TimeScales.Hour;
  }

  /**
   * Returns the title of the controller.
   *
   * @returns {string} - Title string
   */
  getTitle() {
    return 'Sunlight and shadow visualization';
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
          // Selection style
          if (feature.userData.isSelected) return 'green';
          if (feature.userData.isOcculting) return 'pink';

          if (feature.getInfo().batchTable.bLighted) return 'yellow';

          return 'black';
        },
      },
    });
  }

  getCurrentConfig() {
    return this.filteredConfig;
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
   * Get filter names implemented by the current controller.
   *
   * @returns {Array.<string>} - array of string of all filters supported.
   */
  getFiltersName() {
    const days = new Set();
    this.config3DTiles.forEach((element) => {
      const date = Time.extractDateAndHours(element.url);
      if (!date) {
        return;
      }

      const formatedDate = Time.getDateString(date);
      days.add(formatedDate);
    });

    return Array.from(days);
  }

  /**
   * Apply filters on config3DTiles based on filter index.
   *
   * @param {int} filterIndex - The filterIndex parameter is the index of the filter that you want to apply.
   * It is used to determine which filter to apply from the list of available 3DTiles.
   */
  applyFilter(filterIndex) {
    this.filteredConfig = [];
    const dayFilter = this.getFiltersName()[filterIndex];

    // Filter config if the date is the same as the filter
    this.config3DTiles.forEach((element) => {
      const date = Time.extractDateAndHours(element.url);
      if (!date) {
        return;
      }

      const formatedDate = Time.getDateString(date);
      if (formatedDate != dayFilter) {
        return;
      }

      this.filteredConfig.push(element);
    });
  }

  /**
   * The function `getDisplayedDates` extracts dates from URLs in `config3DTiles` and formats them for
   * display.
   *
   * @returns {Array.<string>} an array of formatted dates.
   */
  getDisplayedDates() {
    const dates = [];

    this.getCurrentConfig().forEach((element) => {
      // Check if we can use the date in url
      const date = Time.extractDateAndHours(element.url);
      if (!date) {
        return;
      }

      const formatedDate = Time.getDisplayFor(date, this.timeScale);
      dates.push(formatedDate);
    });

    return dates;
  }

  /**
   * The function `getLegendView()` returns a string containing HTML code for a legend view with
   * color-coded labels.
   *
   * @returns {string} - a string that represents the HTML markup for a legend view.
   */
  getLegendView() {
    return `
              <h2>Legend</h2>
              <div class="legend-item">
                <span class='box' style='background-color:yellow'></span>
                <div class="legend-label">Sunny</div>
              </div>
              <div class="legend-item">
              <span class='box' style='background-color:black'></span>
                <div class="legend-label">Shadow</div>
              </div>
              
              <div class="legend-item">
                <span class='box' style='background-color:green'></span>
                <div class="legend-label">Select Feature</div>
              </div>
              <div class="legend-item">
              <span class='box' style='background-color:pink'></span>
                <div class="legend-label">Occluder Feature</div>
              </div>`;
  }
}
