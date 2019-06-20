import { GeometryId } from './rendering';
import { DataSeriesValues } from './series';

export function isArrayEqual(a: any[] = [], b: any[] = []): boolean {
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

export function belongsToDataSeries(geometryValue: GeometryId, dataSeriesValues: DataSeriesValues): boolean {
  const legendItemSeriesKey = dataSeriesValues.accessors;
  const legendItemSpecId = dataSeriesValues.specId;

  const geometrySeriesKey = geometryValue.seriesKey;
  const geometrySpecId = geometryValue.specId;

  const hasSameSpecId = legendItemSpecId === geometrySpecId;
  const hasSameSeriesKey = isArrayEqual(legendItemSeriesKey, geometrySeriesKey);

  return hasSameSpecId && hasSameSeriesKey;
}
