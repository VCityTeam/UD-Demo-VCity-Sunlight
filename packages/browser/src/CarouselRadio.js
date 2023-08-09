import { itownsWidgets, createLabelInput, THREE } from '@ud-viz/browser';

const DEFAULT_OPTIONS = {
  position: 'bottom-left',
};

/**
 * Clamp a value between a min and max
 *
 * @param value
 * @param min
 * @param max
 * @returns clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

    this.domElement.classList.add('carousel-container');

    // Create previous button
    const previousButton = document.createElement('button');
    previousButton.innerText = 'Previous';
    previousButton.addEventListener('click', (event) => this.previous());
    this.domElement.appendChild(previousButton);

    // Create radios inputs
    this.radioContainer = document.createElement('div');
    this.radioContainer.classList.add('carousel-radios-container');
    this.domElement.appendChild(this.radioContainer);

    // Group all labels under one name / one section
    const groupName = THREE.MathUtils.generateUUID();

    // Create all radios
    this.values = JSON.parse(options.radiosValues);
    this.values.forEach((labelText, index) => {
      const labelInput = createLabelInput(labelText, 'radio');

      labelInput.input.setAttribute('value', index);
      labelInput.input.setAttribute('name', groupName);
      labelInput.input.addEventListener('click', (event) =>
        this.onRadioClick(event)
      );

      this.radioContainer.appendChild(labelInput.parent);
    });

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.addEventListener('click', (event) => this.next());
    this.domElement.appendChild(nextButton);
  }

  /**
   * Set current choices by a given index.
   *
   * @param {index} index - Radio index
   */
  setChoice(index) {
    // Trigger click event on the new input
    const inputs = this.radioContainer.querySelectorAll('input');
    inputs[index].click();
  }

  /**
   * Change selection to the next element.
   */
  next() {
    if (this.values.length <= 0) return;

    // Advance selection index
    const currentSelection = this.radioContainer.querySelector('input:checked');
    let selectionIndex =
      parseInt(currentSelection ? currentSelection.value : 0) + 1;
    selectionIndex = clamp(selectionIndex, 0, this.values.length - 1);

    this.setChoice(selectionIndex);
  }

  /**
   * Change selection to the previous element.
   */
  previous() {
    if (this.values.length <= 0) return;

    // Advance selection index
    const currentSelection = this.radioContainer.querySelector('input:checked');
    let selectionIndex =
      parseInt(currentSelection ? currentSelection.value : 0) - 1;
    selectionIndex = clamp(selectionIndex, 0, this.values.length - 1);

    this.setChoice(selectionIndex);
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
