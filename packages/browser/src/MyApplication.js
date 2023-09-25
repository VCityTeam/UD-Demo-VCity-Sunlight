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
import { OccludePercentController } from './controllers/OccludePercentController';
import { ExposurePercentController } from './controllers/ExposurePercentController';
import { SunlightController } from './controllers/SunlightController';
import { Time } from './utils/Time';

export class MyApplication {
  constructor() {
    this.extent = null;
    this.frame3DPlanar = null;

    this.config3DTiles = [];

    this.timeline = null;
    this.filterCarousel = null;

    this.raySelection = null;

    // Define all controllers / view available in the demos
    this.controllers = [
      new SunlightController(this.config3DTiles),
      new ExposurePercentController(this.config3DTiles),
      // new OccludePercentController(this.config3DTiles),
    ];
    this.controllerIndex = 0;
    this.currentController = this.controllers[this.controllerIndex];
  }

  start() {
    // Load configs file
    FileUtil.loadMultipleJSON([
      '../assets/config/3DTiles.json',
      '../assets/config/elevation.json',
      '../assets/config/base_map.json',
      '../assets/config/extents.json',
    ]).then((configs) => {
      // Check that the date is in the url, because it will be used accross all controllers.
      configs['3DTiles'].forEach((element) => {
        const date = Time.extractDateAndHours(element.url);
        if (date) {
          element.date = date;
          this.config3DTiles.push(element);
        }
      });

      this.initItownsExtent(configs['extents']);
      this.initFrame3D();
      this.initUI();
      this.registersToEvents();
      this.updateView();

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

      this.frame3DPlanar.getItownsView().notifyChange();
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
   * Replace old 3d tiles by new 3DTiles after the date changed.
   *
   * @param {object} config3DTiles - An object containing 3DTiles layers configs
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
      this.replace3DTiles([newConfig]);
    });

    // Switch view
    document
      .querySelector('.btn-switch-view')
      .addEventListener('click', () => this.switchView());
  }
}
