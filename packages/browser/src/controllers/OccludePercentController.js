import { THREE, itowns } from '@ud-viz/browser';
import { AggregateController } from './AggregateController';
import { TimeScales } from '../utils/Time';

/* Aggregate Controller responsible of occludePercent aggregate */
export class OccludePercentController extends AggregateController {
  constructor(config3DTiles) {
    super(config3DTiles);
  }

  getTitle() {
    if (this.timeScale == TimeScales.Day) {
      return 'Impact percentage by day';
    }

    return 'Impact percentage by month';
  }

  /**
   * The function returns a style object that determines the fill color of a feature based on its
   * monthly or daily exposure percentage.
   *
   * @returns {itowns.Style} Itowns style depending on monthly/daily exposure percent
   */
  getStyle() {
    /* Lerp between minimal and maximal colors depending on monthly exposure */
    if (this.timeScale == TimeScales.Month) {
      return new itowns.Style({
        fill: {
          color: function (feature) {
            // Selection style
            if (feature.userData.isSelected) return 'green';
            if (feature.userData.isOcculting) return 'pink';

            const alpha =
              feature.getInfo().batchTable.monthlyOccludePercent / 100;

            const shadowColor = new THREE.Color('rgb(46, 67, 116)');
            const lightedColor = new THREE.Color('rgb(255, 222, 0)');

            return shadowColor.lerp(lightedColor, alpha);
          },
        },
      });
    }

    /* Lerp between minimal and maximal colors depending on daily exposure */
    return new itowns.Style({
      fill: {
        color: function (feature) {
          // Selection style
          if (feature.userData.isSelected) return 'green';
          if (feature.userData.isOcculting) return 'pink';

          const alpha = feature.getInfo().batchTable.dailyOccludePercent / 100;

          const shadowColor = new THREE.Color('rgb(46, 67, 116)');
          const lightedColor = new THREE.Color('rgb(255, 222, 0)');

          return shadowColor.lerp(lightedColor, alpha);
        },
      },
    });
  }

  getFiltersName() {
    return ['Day', 'Month'];
  }

  applyFilter(filterIndex) {
    const filterName = this.getFiltersName()[filterIndex];
    if (filterName == 'Day') {
      this.switchScale(TimeScales.Day);
    } else {
      this.switchScale(TimeScales.Month);
    }
  }

  getLegendView() {
    return `<div class="legend-item gradient-item">
              <span class='box' style='background:linear-gradient(0deg, rgba(46, 67, 116, 1) 0%, rgba(255, 222, 0, 1) 100%)'></span>
              <div class="legend-label">
                <p>High Occlude Amout</p>
                <p>Low Occlude Amout</p>
              </div>
            </div>`;
  }
}
