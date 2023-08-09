import { itownsWidgets, createLabelInput, THREE } from '@ud-viz/browser';

const DEFAULT_OPTIONS = {
  position: 'bottom-left',
};

/**
 * Carousel radios that allows navigation on a long list of radios
 */
export class CarouselRadio extends itownsWidgets.Widget {
  /**
   *
   * @param {itowns.View} itownsView - itowns view
   * @param {object} options - options
   * @param {HTMLElement} options.radiosValues - map of all values displayed (key is used for identifier and value for label text)
   * @param {HTMLElement} options.parentElement - parent element of the widget
   */
  constructor(itownsView, options) {
    super(itownsView, options, DEFAULT_OPTIONS);

    this.radioContainer = document.createElement('div');
    this.radioContainer.classList.add('carousel-radios-container');
    this.domElement.appendChild(this.radioContainer);

    // Group all labels under one name / one section
    const groupName = THREE.MathUtils.generateUUID();

    // Create all radios
    this.values = new Map(Object.entries(JSON.parse(options.radiosValues)));
    this.values.forEach((labelText, index) => {
      const labelInput = createLabelInput(labelText, 'radio');

      labelInput.input.setAttribute('value', index);
      labelInput.input.setAttribute('name', groupName);
      labelInput.input.addEventListener('click', (event) =>
        this.onRadioClick(event)
      );

      this.radioContainer.appendChild(labelInput.parent);
    });
  }

  /**
   * Click event called for each onclick radio.
   *
   * @param {Event} event
   */
  onRadioClick(event) {
    const value = event.currentTarget.getAttribute('value');

    // Custom event gathering all radios click event
    const onSelectEvent = new CustomEvent('onselect', { detail: value });
    this.radioContainer.dispatchEvent(onSelectEvent);
  }
}
