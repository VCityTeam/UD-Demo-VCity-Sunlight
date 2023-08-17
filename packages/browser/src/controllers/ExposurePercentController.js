import { THREE, itowns } from '@ud-viz/browser';
import { AggregateController } from './AggregateController';

/* Aggregate Controller responsible of exposurePercent aggregate */
export class ExposurePercentController extends AggregateController {
  constructor(config3DTiles) {
    super(config3DTiles);
  }

  getStyle() {
    return new itowns.Style({
      fill: {
        color: function (feature) {
          /* Lerp between minimal and maximal colors depending on monthly exposure */
          const alpha =
            feature.getInfo().batchTable.monthlyExposurePercent / 100;

          const yellow = new THREE.Color('rgb(255, 222, 0)');
          const red = new THREE.Color('rgb(210, 0, 26)');

          return yellow.lerp(red, alpha);
        },
      },
    });
  }
}
