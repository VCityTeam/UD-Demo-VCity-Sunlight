import {
  Frame3DPlanar,
  add3DTilesLayers,
  itowns,
  proj4,
  addBaseMapLayer,
  addElevationLayer,
  FileUtil,
} from '@ud-viz/browser';

import { RaySelection } from './components/RaySelection';
import { CarouselRadio } from './components/CarouselRadio';
import { ExposurePercentController } from './controllers/ExposurePercentController';
import { SunlightController } from './controllers/SunlightController';
import { getFeatureBySunlightId } from './utils/Utils';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.config3DTiles = [];
    this.sunlightConfig = null;

    this.timeline = null;
    this.filterCarousel = null;

    this.raySelection = null;

    this.controllers = [];
    this.controllerIndex = 0;
    this.currentController = null;
  }

  start() {
    // Load configs file
    FileUtil.loadMultipleJSON([
      '../assets/config/3DTiles.json',
      '../assets/config/elevation.json',
      '../assets/config/base_map.json',
      '../assets/config/extents.json',
      '../assets/config/sunlight_results.json',
    ]).then((configs) => {
      this.config3DTiles = configs['3DTiles'];
      this.sunlightConfig = configs['sunlight_results'];

      this.initItownsExtent(configs['extents']);
      this.initFrame3D();
      this.initUI();
      this.registersToEvents();

      // Add default 3D Tiles
      add3DTilesLayers(this.config3DTiles, this.frame3DPlanar.getItownsView());
      this.frame3DPlanar.getItownsView().notifyChange();

      // Update view only after loading all features
      this.getGeometryLayer().addEventListener(
        itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
        ({ tileContent }) => {
          tileContent.traverse((el) => {
            // Update view only when a tile with geomtry is loaded
            if (el.geometry && el.geometry.attributes._BATCHID) {
              this.updateView();
            }
          });
        }
      );

      addBaseMapLayer(
        configs['base_map'],
        this.frame3DPlanar.getItownsView(),
        this.extent
      );

      addElevationLayer(
        configs['elevation'],
        this.frame3DPlanar.getItownsView(),
        this.extent
      );

      // Define all controllers / view available in the demos
      this.controllers = [
        new SunlightController(this.sunlightConfig),
        // new ExposurePercentController(this.sunlightConfig),
      ];
      this.controllerIndex = 0;
      this.currentController = this.controllers[this.controllerIndex];
    });
  }

  initItownsExtent(configExtent) {
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

  /**
   * The function `getGeometryLayer()` returns the geometry layer with the specified ID from the 3D
   * planar frame.
   *
   * @returns the geometry layer with the specified layerId.
   */
  getGeometryLayer() {
    const layerId = this.config3DTiles[0].id;
    return this.frame3DPlanar.getItownsView().getLayerById(layerId);
  }

  /**
   * Replace 3D Tiles batch table after the date changed.
   *
   * @param {object} sunlightConfig - An object containing configs
   * @param {int} tileIndex - Tile index thaht will be updated
   */
  replaceBatchTable(sunlightConfig, tileIndex = 0) {
    // Construct path containing sunlight result for a given timestamps and tileIndex
    const tile_path =
      this.sunlightConfig.root_path +
      '/' +
      sunlightConfig +
      '/' +
      tileIndex +
      '.json';

    FileUtil.loadJSON(tile_path).then((batchTable) => {
      // Get geometry layer currently displayed
      const layer = this.getGeometryLayer();

      for (const featureId in batchTable) {
        // Get current feature associated to the batch table
        const result = batchTable[featureId];
        const feature = getFeatureBySunlightId(layer, featureId);

        // Replace batch table with new content
        for (const key in result) {
          feature.getInfo().batchTable[key] = result[key];
        }
      }

      // Recursive call to replace tile on the fly
      if (tileIndex < layer.tilesC3DTileFeatures.size - 1) {
        this.replaceBatchTable(sunlightConfig, tileIndex + 1);
      } else {
        // Redraw the current view when the last tile is updated
        layer.updateStyle();
        this.frame3DPlanar.getItownsView().notifyChange();
      }
    });
  }

  initUI() {
    // Add title
    const title = document.createElement('h1');
    title.classList.add('container');
    this.frame3DPlanar.appendToUI(title);

    // Bottom container containing all main buttons
    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('container');
    bottomContainer.classList.add('bottom-widget');
    bottomContainer.classList.add('bottom-container');
    this.frame3DPlanar.appendToUI(bottomContainer);

    // Switch view
    const buttonSwitchView = document.createElement('button');
    buttonSwitchView.innerText = 'Switch View';
    buttonSwitchView.classList.add('btn-switch-view');
    buttonSwitchView.classList.add('custom-btn');
    bottomContainer.appendChild(buttonSwitchView);

    // Filter and date selection container
    const selectionContainer = document.createElement('div');
    selectionContainer.classList.add('date-selection-container');
    bottomContainer.appendChild(selectionContainer);

    const filterTitle = document.createElement('h2');
    filterTitle.innerText = 'Filters';
    selectionContainer.appendChild(filterTitle);

    // Group by buttons
    this.filterCarousel = new CarouselRadio(
      this.frame3DPlanar.getItownsView(),
      { parentElement: selectionContainer }
    );

    // Add timelapse radios
    this.timeline = new CarouselRadio(this.frame3DPlanar.getItownsView(), {
      parentElement: selectionContainer,
      timelapseState: true,
    });

    // Ray selection on feature
    this.raySelection = new RaySelection(this.frame3DPlanar);

    const legendContainer = document.createElement('div');
    legendContainer.classList.add('container');
    legendContainer.classList.add('legend-container');
    this.frame3DPlanar.appendToUI(legendContainer);
  }

  /**
   * The switchView function switches between two different controllers and updates the view.
   */
  switchView() {
    if (this.controllers.length <= 0) {
      console.error('Controllers are undefined.');
      return;
    }

    // Loop controller as an infinite list
    this.controllerIndex++;
    if (this.controllers.length <= this.controllerIndex) {
      this.controllerIndex = 0;
    }

    this.currentController = this.controllers[this.controllerIndex];
    this.raySelection.resetSelection();
    this.updateView();
  }

  /**
   * The function updates the view by applying styles and updating the timeline based on the controller.
   */
  updateView() {
    this.applyStyle();

    // Update filters
    const filters = this.currentController.getFiltersName();
    this.filterCarousel.setChoices(filters);
    this.filterCarousel.triggerChoice(0);

    this.updateTimeline();

    this.updateTitle();

    // Update legend
    const legendContainer = document.querySelector('.legend-container');

    // Common legend between each view
    legendContainer.innerHTML = `<h2>Legend</h2>
                            
                                <div class="legend-item">
                                  <span class='box' style='background-color:green'></span>
                                  <p class="legend-label">Select Feature</p>
                                </div>
                                <div class="legend-item">
                                  <span class='box' style='background-color:pink'></span>
                                  <p class="legend-label">Occluder Feature</p>
                                </div>`;
    legendContainer.innerHTML += this.currentController.getLegendView();
  }

  /**
   * The function applies the current controller style to all C3DTiles
   * layers in a 3D planar frame and notifies the view of the change.
   */
  applyStyle() {
    this.frame3DPlanar
      .getItownsView()
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        layer.style = this.currentController.getStyle();
      });

    this.frame3DPlanar.getItownsView().notifyChange();
  }

  /**
   * Update the timeline with the displayed dates obtained from the controller.
   */
  updateTimeline() {
    const dates = this.currentController.getDisplayedDates();
    this.timeline.setChoices(dates);
    this.timeline.triggerChoice(0);
  }

  /**
   * Update title page based on controller title.
   */
  updateTitle() {
    document.querySelector('h1').innerText = this.currentController.getTitle();
  }

  /**
   * Register to all selection events from the user (feature selected, timelapse played...).
   */
  registersToEvents() {
    // Apply filters on controller
    this.filterCarousel.radioContainer.addEventListener('onselect', (event) => {
      this.currentController.applyFilter(event.detail);
      this.updateTimeline();
      this.updateTitle();
    });

    // Switch 3DTiles with a new timestamp
    this.timeline.radioContainer.addEventListener('onselect', (event) => {
      this.raySelection.resetSelection();
      const newConfig = this.currentController.getConfigAt(event.detail);
      this.replaceBatchTable(newConfig);
    });

    // Switch view
    document
      .querySelector('.btn-switch-view')
      .addEventListener('click', () => this.switchView());
  }
}
