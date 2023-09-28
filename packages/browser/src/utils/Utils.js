import { itowns } from '@ud-viz/browser';

/**
 * Get feature from the sunlight id.
 * A sunlight id follow these format : 'Tile-tiles/0.b3dm__Feature-0__Triangle-823'
 *
 * @param {itowns.C3DTilesLayer} layer - 3DTiles layer containing all features.
 * @param {string} sunlightId - Sunlight id use to search an element.
 * @returns {itowns.C3DTFeature} - Feature present in the layer.
 */
export function getFeatureBySunlightId(layer, sunlightId) {
  // Check if the input string matches the expected format
  const formatRegex = /^Tile-tiles\/\d+\.b3dm__Feature-\d+__Triangle-\d+$/;
  if (!formatRegex.test(sunlightId)) {
    console.log(
      'Sunlight id does not follow the expected format : ' + sunlightId
    );
    return null;
  }

  // Extract the number before "b3dm"
  let tileIndex = sunlightId.match(/(\d+)\.b3dm/);
  // +1 because itowns tiles start at 1
  tileIndex = parseInt(tileIndex[1]) + 1;

  // Extract the last number in the string
  let featureId = sunlightId.match(/(\d+)$/);
  featureId = parseInt(featureId[1]);

  return layer.tilesC3DTileFeatures.get(tileIndex).get(featureId);
}

/**
 * The clamp function returns a value that is clamped between a minimum and maximum value.
 *
 * @param {number} value - The value parameter represents the value that you want to clamp or restrict within a
 * certain range.
 * @param {number} min - The "min" parameter represents the minimum value that the "value" parameter can be.
 * @param {number} max - The maximum value that the "value" parameter can be.
 * @returns {number} the value clamped between the minimum and maximum values.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
