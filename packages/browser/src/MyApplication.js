import {
  Frame3DPlanar,
  add3DTilesLayers,
  itowns,
  proj4,
} from '@ud-viz/browser';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.domElement = document.createElement('div');
  }

  start() {
    this.initItownsExtent();
    this.initFrame3D();
    this.init3DTiles();
    this.initUI();
  }

  initItownsExtent() {
    /** Extent Code: https://github.com/search?q=repo%3AiTowns%2Fitowns+path%3A%2FExtent.js&type=code */
    const configExtent = {
      crs: 'EPSG:3946',
      west: 1839800,
      east: 1844000,
      south: 5175000,
      north: 5178000,
    };

    proj4.default.defs(
      configExtent.crs,
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );

    this.extent = new itowns.Extent(
      configExtent.crs,
      parseInt(configExtent.west),
      parseInt(configExtent.east),
      parseInt(configExtent.south),
      parseInt(configExtent.north)
    );
  }

  initFrame3D() {
    /** Frame3DPlanar Code: https://github.com/search?q=repo%3AVCityTeam%2FUD-Viz+path%3A%2FFrame3DPlanar.js+&type=code */
    const configFrame3D = {
      hasItownsControls: true,
      range: 4000,
      heading: 1,
      tilt: 70,
    };

    this.frame3DPlanar = new Frame3DPlanar(this.extent, configFrame3D);
  }

  init3DTiles() {
    // /// ADD 3D LAYERS
    const config3DTiles = [
      {
        id: 'Lyon-1',
        url: 'https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/2015/Lyon-1_2015/tileset.json',
        color: '0xFFFFFF',
      },
    ];

    add3DTilesLayers(config3DTiles, this.frame3DPlanar.itownsView);
  }

  initUI() {
    const label = document.createElement('h1');
    label.textContent = 'Hello application !';
    this.domElement.appendChild(label);

    this.frame3DPlanar.appendToUI(this.domElement);
  }
}
