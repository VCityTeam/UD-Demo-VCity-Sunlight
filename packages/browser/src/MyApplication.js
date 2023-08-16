import {
  Frame3DPlanar,
  add3DTilesLayers,
  itowns,
  proj4,
  Widget,
} from '@ud-viz/browser';

import { CarouselRadio } from './CarouselRadio';
import { ExposurePercentView } from './views/ExposurePercentView';
import { SunlightView } from './views/SunlightView';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.domElement = document.createElement('div');

    // Add Layer infos to update style only on one layer
    this.currentSelection = {
      feature: null,
      occultingFeature: null,
      layer: null,
    };

    this.selectionWidget = null;
    this.timeline = null;
    this.view = new SunlightView();
  }

  start() {
    this.initItownsExtent();
    this.initFrame3D();
    this.init3DTiles();
    this.initUI();
    this.applyViewStyle();
    this.registerToSelectionEvents();
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
   * @returns Config array of 3DTiles
   */
  getConfig3DTiles() {
    return [
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__0800/tileset.json',
        color: '0xFFFFFF',
        date: '08H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__0900/tileset.json',
        color: '0xFFFFFF',
        date: '09H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1000/tileset.json',
        color: '0xFFFFFF',
        date: '10H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1100/tileset.json',
        color: '0xFFFFFF',
        date: '11H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1200/tileset.json',
        color: '0xFFFFFF',
        date: '12H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1300/tileset.json',
        color: '0xFFFFFF',
        date: '13H',
      },
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1400/tileset.json',
        color: '0xFFFFFF',
        date: '14H',
      },
    ];
  }

  init3DTiles() {
    // ADD 3D LAYERS
    const config3DTiles = this.getConfig3DTiles();

    add3DTilesLayers([config3DTiles[0]], this.frame3DPlanar.getItownsView());
  }

  /**
   * Replace old 3d tiles by new 3DTiles after the date changed.
   *
   * @param {config3DTilesLayers} config3DTiles - An object containing 3DTiles layers configs
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
    this.applyViewStyle();
    this.frame3DPlanar.getItownsView().notifyChange();
  }

  initUI() {
    // Add selection widget
    this.selectionWidget = new Widget.C3DTiles(this.frame3DPlanar.itownsView, {
      overrideStyle: new itowns.Style({ fill: { color: 'white' } }),
      parentElement: this.domElement,
      layerContainerClassName: 'widgets-3dtiles-layer-container',
      c3DTFeatureInfoContainerClassName: 'widgets-3dtiles-feature-container',
      urlContainerClassName: 'widgets-3dtiles-url-container',
    });
    this.selectionWidget.domElement.setAttribute('id', 'widgets-3dtiles');

    // Bottom container containing all main buttons
    const bottomContainer = document.createElement('div');
    bottomContainer.classList.add('bottom-widget');
    bottomContainer.classList.add('bottom-container');
    this.domElement.appendChild(bottomContainer);

    const butonSwitchView = document.createElement('button');
    butonSwitchView.innerText = 'Switch View';
    butonSwitchView.classList.add('btn-switch-view');
    butonSwitchView.classList.add('custom-btn');
    bottomContainer.appendChild(butonSwitchView);

    // Add timelapse radios

    // Sample datas only for testing purpose.
    const dates = [];
    const config3DTiles = this.getConfig3DTiles();
    config3DTiles.forEach((element) => {
      dates.push(element.date);
    });
    const jsonDates = JSON.stringify(dates);

    this.timeline = new CarouselRadio(this.frame3DPlanar.getItownsView(), {
      parentElement: bottomContainer,
      radiosValues: jsonDates,
    });

    this.frame3DPlanar.appendToUI(this.domElement);
  }

  /**
   * Update style based on batch table and Sunlight result.
   */
  applyViewStyle() {
    this.frame3DPlanar
      .getItownsView()
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        layer.style = this.view.getStyle();
      });

    this.frame3DPlanar.getItownsView().notifyChange();
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

  switchView() {
    this.view =
      this.view instanceof ExposurePercentView
        ? new SunlightView()
        : new ExposurePercentView();

    this.applyViewStyle();
  }

  /**
   * Register to all selection events from the user (feature selected, timelapse played...).
   */
  registerToSelectionEvents() {
    this.frame3DPlanar
      .getRootWebGL()
      .addEventListener('click', (event) => this.updateSelection(event));

    // Switch 3DTiles with a new timestamp
    this.timeline.radioContainer.addEventListener('onselect', (event) => {
      const config3DTile = this.getConfig3DTiles()[event.detail];
      this.replace3DTiles([config3DTile]);
    });

    // Switch view
    document
      .querySelector('.btn-switch-view')
      .addEventListener('click', (event) => this.switchView());
  }
}
