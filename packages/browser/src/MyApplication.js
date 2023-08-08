import {
  Frame3DPlanar,
  add3DTilesLayers,
  itowns,
  proj4,
  Widget,
} from '@ud-viz/browser';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.domElement = document.createElement('div');

    // Add Layer infos to update style only on one layer
    this.currentSelection = { feature: null, layer: null };

    this.selectionWidget = null;
  }

  start() {
    this.initItownsExtent();
    this.initFrame3D();
    this.init3DTiles();
    this.initUI();
    this.applyLightStyle();
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

  init3DTiles() {
    // ADD 3D LAYERS
    const config3DTiles = [
      {
        id: 'Hotel-Police',
        url: '../assets/Hotel-Police/2016-01-01__1400/tileset.json',
        color: '0xFFFFFF',
      },
    ];

    add3DTilesLayers(config3DTiles, this.frame3DPlanar.getItownsView());
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

    this.frame3DPlanar.appendToUI(this.domElement);
  }

  /**
   * Update style based on batch table and Sunlight result.
   * Red : feature is currently selected.
   * Yellow : feature is in the light.
   * Black : feature is in the shadow.
   */
  applyLightStyle() {
    const myStyle = new itowns.Style({
      fill: {
        color: function (feature) {
          if (feature.userData.isSelected) return 'red';

          if (feature.getInfo().batchTable.bLighted) return 'yellow';

          return 'black';
        },
      },
    });

    // Apply style to layers
    this.frame3DPlanar
      .getItownsView()
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        layer.style = myStyle;
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
    }
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
   * Register to all selection events from the user (feature selected, timelapse played...).
   */
  registerToSelectionEvents() {
    this.frame3DPlanar.getRootWebGL().onclick = (event) =>
      this.updateSelection(event);
  }
}
