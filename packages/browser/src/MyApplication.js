import {
  Frame3DPlanar,
  add3DTilesLayers,
  itowns,
  proj4,
  Widget,
} from '@ud-viz/browser';

import { CarouselRadio } from './CarouselRadio';
import { ExposurePercentController } from './controllers/ExposurePercentController';
import { SunlightController } from './controllers/SunlightController';
import { Time } from './utils/Time';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.config3DTiles = this.formatConfig3DTiles();

    // Add Layer infos to update style only on one layer
    this.currentSelection = {
      feature: null,
      occultingFeature: null,
      layer: null,
    };

    this.selectionWidget = null;
    this.timeline = null;
    this.filterCarousel = null;
    this.controller = new SunlightController(this.config3DTiles);
  }

  start() {
    this.initItownsExtent();
    this.initFrame3D();
    this.initUI();
    this.registerToSelectionEvents();
    this.updateView();
  }

  initItownsExtent() {
    /** Extent Code: https://github.com/search?q=repo%3AiTowns%2Fitowns+path%3A%2FExtent.js&type=code */
    const configExtent = {
      crs: 'EPSG:3946',
      west: 1837860.980127206,
      east: 1851647,
      south: 5169347.4265999,
      north: 5180575,
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

  /**
   * Get all 3dTiles for several timestamp. Each element corresponds to
   * a sunlight result at a given timestamp.
   *
   * @returns {config3DTiles} Config array of 3DTiles
   */
  formatConfig3DTiles() {
    const config = [
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__0800/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__0900/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1300/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1400/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-02__0900/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-02__1400/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-02-01__0900/tileset.json',
        color: '0xFFFFFF',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-02-01__1400/tileset.json',
        color: '0xFFFFFF',
      },
    ];

    // Add date from the url in each config3DTiles that will be used accross all application
    const output = [];
    config.forEach((element) => {
      const date = Time.extractDateAndHours(element.url);
      if (date) {
        element.date = date;
        output.push(element);
      }
    });

    return output;
  }

  /**
   * Replace old 3d tiles by new 3DTiles after the date changed.
   *
   * @param {config3DTiles} config3DTiles - An object containing 3DTiles layers configs
   */
  replace3DTiles(config3DTiles) {
    // Remove previous 3DTiles because we change the timestamp
    this.frame3DPlanar
      .getItownsView()
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        this.frame3DPlanar.getItownsView().removeLayer(layer.id);
      });

    add3DTilesLayers(config3DTiles, this.frame3DPlanar.getItownsView());

    // Apply light style on new 3DTiles
    this.applyStyle();
    this.frame3DPlanar.getItownsView().notifyChange();
  }

  initUI() {
    // Add title
    const title = document.createElement('h1');
    this.frame3DPlanar.appendToUI(title);

    // Add selection widget
    this.selectionWidget = new Widget.C3DTiles(
      this.frame3DPlanar.getItownsView(),
      {
        overrideStyle: new itowns.Style({ fill: { color: 'white' } }),
        parentElement: this.frame3DPlanar.ui,
        layerContainerClassName: 'widgets-3dtiles-layer-container',
        c3DTFeatureInfoContainerClassName: 'widgets-3dtiles-feature-container',
        urlContainerClassName: 'widgets-3dtiles-url-container',
      }
    );
    this.selectionWidget.domElement.setAttribute('id', 'widgets-3dtiles');

    // Bottom container containing all main buttons
    const bottomContainer = document.createElement('div');
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
  }

  /**
   * Reset and dispose current selection
   */
  resetSelection() {
    if (this.currentSelection.feature) {
      // reset feature userData
      this.currentSelection.feature.userData.isSelected = false;
      // and update style of its layer
      this.currentSelection.layer.updateStyle();
      // reset context selection
      this.currentSelection.feature = null;
      this.currentSelection.layer = null;

      // Reset occulting feature state
      if (this.currentSelection.occultingFeature)
        this.currentSelection.occultingFeature.userData.isOcculting = false;

      this.currentSelection.occultingFeature = null;
    }
  }

  /**
   * Get feature from the occulting id.
   * An occulting id follow these format : 'Tile-tiles/0.b3dm__Feature-0__Triangle-823'
   *
   * @param {itowns.C3DTilesLayer} layer 3DTiles layer containing all features.
   * @param {string} occultingId Occulting id use to search an element.
   * @returns Feature present in the layer.
   */
  getFeatureByOccultingId(layer, occultingId) {
    // Check if the input string matches the expected format
    const formatRegex = /^Tile-tiles\/\d+\.b3dm__Feature-\d+__Triangle-\d+$/;
    if (!formatRegex.test(occultingId)) {
      console.log(
        'Occulting id does not follow the expected format : ' + occultingId
      );
      return null;
    }

    // Extract the number before "b3dm"
    let tileIndex = occultingId.match(/(\d+)\.b3dm/);
    // +1 because itowns tiles start at 1
    tileIndex = parseInt(tileIndex[1] + 1);

    // Extract the last number in the string
    let featureId = occultingId.match(/(\d+)$/);
    featureId = parseInt(featureId[1]);

    return layer.tilesC3DTileFeatures.get(tileIndex).get(featureId);
  }

  /**
   * Set the current feature and layer selected by the user.
   *
   * @param event
   */
  updateSelection(event) {
    this.resetSelection();

    // get intersects based on the click event
    const intersects = this.frame3DPlanar.getItownsView().pickObjectsAt(
      event,
      0,
      this.frame3DPlanar
        .getItownsView()
        .getLayers()
        .filter((el) => el.isC3DTilesLayer)
    );
    if (intersects.length) {
      // get featureClicked
      const featureClicked =
        intersects[0].layer.getC3DTileFeatureFromIntersectsArray(intersects);
      if (featureClicked) {
        this.currentSelection.feature = featureClicked;
        this.currentSelection.layer = intersects[0].layer;

        // Change occulting feature state to display information about it
        if (!featureClicked.getInfo().batchTable.bLighted) {
          this.currentSelection.occultingFeature = this.getFeatureByOccultingId(
            this.currentSelection.layer,
            this.currentSelection.feature.getInfo().batchTable.blockerId
          );

          this.currentSelection.occultingFeature.userData.isOcculting = true;
        }

        // Update layer to display current selection
        this.currentSelection.feature.userData.isSelected = true;
        this.currentSelection.layer.updateStyle();
      }
    }

    // Update widget displayed info
    this.selectionWidget.displayC3DTFeatureInfo(
      this.currentSelection.feature,
      this.currentSelection.layer
    );

    // Redraw the current view
    this.frame3DPlanar.getItownsView().notifyChange();
  }

  /**
   * The switchView function switches between two different controllers and updates the view.
   */
  switchView() {
    this.controller =
      this.controller instanceof ExposurePercentController
        ? new SunlightController(this.config3DTiles)
        : new ExposurePercentController(this.config3DTiles);

    this.updateView();
  }

  /**
   * The function updates the view by applying styles and updating the timeline based on the controller.
   */
  updateView() {
    this.applyStyle();

    // Update filters
    const filters = this.controller.getFiltersName();
    this.filterCarousel.setChoices(filters);
    this.filterCarousel.triggerChoice(0);

    this.updateTimeline();

    this.updateTitle();
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
        layer.style = this.controller.getStyle();
      });

    this.frame3DPlanar.getItownsView().notifyChange();
  }

  /**
   * Update the timeline with the displayed dates obtained from the controller.
   */
  updateTimeline() {
    const dates = this.controller.getDisplayedDates();
    this.timeline.setChoices(dates);
    this.timeline.triggerChoice(0);
  }

  /**
   * Update title page based on controller title.
   */
  updateTitle() {
    document.querySelector('h1').innerText = this.controller.getTitle();
  }

  /**
   * Register to all selection events from the user (feature selected, timelapse played...).
   */
  registerToSelectionEvents() {
    this.frame3DPlanar
      .getRootWebGL()
      .addEventListener('click', (event) => this.updateSelection(event));

    // Apply filters on controller
    this.filterCarousel.radioContainer.addEventListener('onselect', (event) => {
      this.controller.applyFilter(event.detail);
      this.updateTimeline();
      this.updateTitle();
    });

    // Switch 3DTiles with a new timestamp
    this.timeline.radioContainer.addEventListener('onselect', (event) => {
      const newConfig = this.controller.getConfigAt(event.detail);
      this.replace3DTiles([newConfig]);
    });

    // Switch view
    document
      .querySelector('.btn-switch-view')
      .addEventListener('click', (event) => this.switchView());
  }
}
