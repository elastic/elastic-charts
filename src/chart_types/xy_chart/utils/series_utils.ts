import { SeriesCollectionValue, SeriesIdentifier } from './series';

export function isEqualSeriesKey(a: any[], b: any[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function belongsToDataSeries(
  geometryValue: SeriesIdentifier,
  dataSeriesValues: SeriesCollectionValue,
): boolean {
  const legendItemSeriesKey = dataSeriesValues.seriesKeys;
  const legendItemSpecId = dataSeriesValues.specId;

  const geometrySeriesKey = geometryValue.seriesKeys;
  const geometrySpecId = geometryValue.specId;

  const hasSameSpecId = legendItemSpecId === geometrySpecId;
  const hasSameSeriesKey = isEqualSeriesKey(legendItemSeriesKey, geometrySeriesKey);

  return hasSameSpecId && hasSameSeriesKey;
}
