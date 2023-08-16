import { itowns } from '@ud-viz/browser';

export class SunlightView {
  constructor() {}

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
}
