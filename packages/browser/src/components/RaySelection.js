import { Widget, itowns, Frame3DPlanar } from '@ud-viz/browser';
import { getFeatureByOccultingId } from '../utils/Utils';

/* The `Selection` class represents a selection widget for displaying 3DTiles batch table information 
and allows the user to select features. */
export class RaySelection {
  /**
   * Initializes the current selection, creates a selection widget, and adds
   * an event listener to update the selection on click.
   *
   * @param {Frame3DPlanar} frame3DPlanar
   */
  constructor(frame3DPlanar) {
    // Add Layer infos to update style only on one layer
    this.currentSelection = {
      feature: null,
      occultingFeature: null,
      layer: null,
    };

    // Selection widget
    this.frame3DPlanar = frame3DPlanar;
    this.selectionWidget = this.createWidget();

    // Update selection on click
    this.registerToEvent();
  }

  /**
   * Creates a new selection widget for displaying 3D tiles batch table infos.
   *
   * @returns {Widget.C3DTiles} The function `createWidget()` returns an instance of the `Widget.C3DTiles` class.
   */
  createWidget() {
    const temp = new Widget.C3DTiles(this.frame3DPlanar.getItownsView(), {
      overrideStyle: new itowns.Style({ fill: { color: 'white' } }),
      parentElement: this.frame3DPlanar.ui,
      layerContainerClassName: 'widgets-3dtiles-layer-container',
      c3DTFeatureInfoContainerClassName: 'widgets-3dtiles-feature-container',
      urlContainerClassName: 'widgets-3dtiles-url-container',
    });
    temp.domElement.setAttribute('id', 'widgets-3dtiles');

    return temp;
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
          this.currentSelection.occultingFeature = getFeatureByOccultingId(
            this.currentSelection.layer,
            this.currentSelection.feature.getInfo().batchTable.occultingId
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
   * Registers a click event listener on a DOM element and calls the updateSelection
   * function when the event occurs.
   */
  registerToEvent() {
    this.frame3DPlanar.getRootWebGL().addEventListener('click', (event) => {
      this.updateSelection(event);
    });
  }
}
