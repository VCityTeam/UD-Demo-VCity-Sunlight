import { THREE, itowns } from '@ud-viz/browser';
import { AggregateController } from './AggregateController';
import { TimeScales } from '../utils/Time';

/* Aggregate Controller responsible of exposurePercent aggregate */
export class ExposurePercentController extends AggregateController {
  constructor(config3DTiles) {
    super(config3DTiles);
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
            const alpha =
              feature.getInfo().batchTable.monthlyExposurePercent / 100;

            const yellow = new THREE.Color('rgb(255, 222, 0)');
            const red = new THREE.Color('rgb(210, 0, 26)');

            return yellow.lerp(red, alpha);
          },
        },
      });
    }

    /* Lerp between minimal and maximal colors depending on daily exposure */
    return new itowns.Style({
      fill: {
        color: function (feature) {
          const alpha = feature.getInfo().batchTable.dailyExposurePercent / 100;

          const yellow = new THREE.Color('rgb(255, 222, 0)');
          const red = new THREE.Color('rgb(210, 0, 26)');

          return yellow.lerp(red, alpha);
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
}
