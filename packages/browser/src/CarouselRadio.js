import {
  itownsWidgets,
  createLabelInput,
  THREE,
  clearChildren,
} from '@ud-viz/browser';

const DEFAULT_OPTIONS = {
  position: 'bottom',
};

/**
 * Clamp a value between a min and max, because JS doesn't
 * provide one by default : https://webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript
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
 * Carousel radios that allows navigation on a long list of radios.
 */
export class CarouselRadio extends itownsWidgets.Widget {
  /**
   *
   * @param {itowns.View} itownsView - itowns view
   * @param {object} options - Options
   * @param {Array.<string>} options.choices - Array of all values displayed (index is used for identifier and value for label text)
   * @param {boolean} options.timelapseState - Timelapse functionnalities state, disable by default.
   * @param {string} options.title - Title carousel at the top of carousel.
   * @param {HTMLElement} options.parentElement - parent element of the widget
   */
  constructor(itownsView, options) {
    super(itownsView, options, DEFAULT_OPTIONS);

    this.createHTMLStructure(options);

    // Create all radios
    if (options.choices) {
      this.setChoices(options.choices);
    }

    // Enable / Disable timelapse and autoplay button
    this.setTimelapseState(
      options.timelapseState ? options.timelapseState : false
    );

    // Autoplay configuration to play a timelapse
    this.autoPlayInterval = null;
    this.autoPlayTimeInMs = 2000;
  }

  /**
   * The function creates the HTML structure for a carousel component with previous and next buttons,
   * radio inputs, and a play button.
   *
   * @param {object} options - Options
   */
  createHTMLStructure(options) {
    this.domElement.classList.add('carousel-container');

    // Create previous button
    const previousButton = document.createElement('button');
    previousButton.innerText = 'Previous';
    previousButton.addEventListener('click', (event) => {
      this.stopAutoPlay();
      this.previous();
    });
    this.domElement.appendChild(previousButton);

    // Radio title
    if (options.title) {
      const title = document.createElement('h2');
      title.innerText = options.title;
      this.domElement.appendChild(title);
    }

    // Radio container
    this.radioContainer = document.createElement('div');
    this.radioContainer.classList.add('carousel-radios-container');
    this.domElement.appendChild(this.radioContainer);

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.addEventListener('click', (event) => {
      this.stopAutoPlay();
      this.next();
    });
    this.domElement.appendChild(nextButton);

    // Create play button
    const autoPlayButton = document.createElement('button');
    autoPlayButton.innerText = 'Play';
    autoPlayButton.classList.add('auto-play-button');
    autoPlayButton.addEventListener('click', (event) => {
      // Toggle autoPlay state
      if (this.autoPlayInterval) {
        // Cleanup - stop interval already running
        this.stopAutoPlay();
        return;
      }

      // Called the function to give an immediate response,
      // because set interval will be called after the timer
      this.autoPlay();

      this.autoPlayInterval = setInterval(
        () => this.autoPlay(),
        this.autoPlayTimeInMs
      );
    });

    this.domElement.appendChild(autoPlayButton);
  }

  /**
   * The `setChoices` function sets the choices for a radio button group and creates the corresponding
   * input radio elements.
   *
   * @param {Array.<string>} choices - An array of strings representing the choices for the radio buttons.
   */
  setChoices(choices) {
    this.values = choices;

    // Remove previous choices / children
    clearChildren(this.radioContainer);

    // Group all labels under one name / one section
    const groupName = THREE.MathUtils.generateUUID();

    // Create an input radio for each choice
    this.values.forEach((labelText, index) => {
      const labelInput = createLabelInput(labelText, 'radio');
      labelInput.parent.classList.add('radio-group');
      labelInput.parent.classList.add('custom-btn');

      labelInput.input.setAttribute('value', index);
      labelInput.input.setAttribute('name', groupName);
      labelInput.input.addEventListener('click', (event) =>
        this.onRadioClick(event)
      );

      this.radioContainer.appendChild(labelInput.parent);
    });
  }

  /**
   * Trigger choice by a given index.
   *
   * @param {index} index - Radio index
   */
  triggerChoice(index) {
    // Trigger click event on the new input
    const inputs = this.radioContainer.querySelectorAll('input');
    inputs[index].click();
  }

  /**
   * Get the current value checked or if undefined, a default value.
   *
   * @returns selection index
   */
  getCurrentSelectionIndex() {
    const currentSelection = this.radioContainer.querySelector('input:checked');
    // Default value for selection index is 0
    return parseInt(currentSelection ? currentSelection.value : 0);
  }

  /**
   * Change selection to the next element.
   */
  next() {
    if (this.values.length <= 0) return;

    // Advance selection index
    let selectionIndex = this.getCurrentSelectionIndex() + 1;
    selectionIndex = clamp(selectionIndex, 0, this.values.length - 1);

    this.triggerChoice(selectionIndex);
  }

  /**
   * Change selection to the previous element.
   */
  previous() {
    if (this.values.length <= 0) return;

    // Advance selection index
    let selectionIndex = parseInt(this.getCurrentSelectionIndex()) - 1;
    selectionIndex = clamp(selectionIndex, 0, this.values.length - 1);

    this.triggerChoice(selectionIndex);
  }

  /**
   * Sets the state of the timelapse feature and displays or hides the autoplay button accordingly.
   *
   * @param {boolean} enabled - Determines whether the timelapse state should be enabled or disabled.
   */
  setTimelapseState(enabled) {
    // Show / Hide timelaspe autoplay button
    const autoPlayButton = this.domElement.querySelector('.auto-play-button');
    autoPlayButton.display = enabled ? 'initial' : 'none';

    this.timelapseState = enabled;
  }

  /**
   * Manage autoplay lifetime and trigger next function.
   */
  autoPlay() {
    if (!this.timelapseState) return;

    // Stop autoPlay when reaching the end
    if (this.getCurrentSelectionIndex() === this.values.length - 1) {
      this.stopAutoPlay();
      return;
    }

    const autoPlayButton = this.domElement.querySelector('.auto-play-button');
    autoPlayButton.innerText = 'Pause';
    this.next();
  }

  /**
   * Stop and reset the autoPlay.
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;

      const autoPlayButton = this.domElement.querySelector('.auto-play-button');
      autoPlayButton.innerText = 'Play';
    }
  }

  /**
   * Click event called for each onclick radio.
   *
   * @param {Event} event
   */
  onRadioClick(event) {
    if (event.isTrusted && this.autoPlayInterval) {
      this.stopAutoPlay();
    }

    // Remove style of the previous selection
    const previousRadioGroup = this.radioContainer.querySelector(
      '.radio-group.checked'
    );
    if (previousRadioGroup) previousRadioGroup.classList.remove('checked');

    const value = event.currentTarget.getAttribute('value');

    // Add style to the current selection
    event.currentTarget.parentElement.classList.add('checked');

    // Custom event gathering all radios click event
    const onSelectEvent = new CustomEvent('onselect', { detail: value });
    this.radioContainer.dispatchEvent(onSelectEvent);
  }
}
