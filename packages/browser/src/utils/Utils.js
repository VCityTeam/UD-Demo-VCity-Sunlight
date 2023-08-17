/**
 * Get feature from the occulting id.
 * An occulting id follow these format : 'Tile-tiles/0.b3dm__Feature-0__Triangle-823'
 *
 * @param {itowns.C3DTilesLayer} layer 3DTiles layer containing all features.
 * @param {string} occultingId Occulting id use to search an element.
 * @returns Feature present in the layer.
 */
export function getFeatureByOccultingId(layer, occultingId) {
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
