import { GeometryValue } from './rendering';
import { DataSeriesColorsValues } from './series';

export function isEqualSeriesKey(a: any[], b: any[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let ret = true;

  a.forEach((aVal: any, idx: number) => {
    if (aVal !== b[idx]) {
      ret = false;
    }
  });

  return ret;
}

export function belongsToDataSeries(geometryValue: GeometryValue, dataSeriesValues: DataSeriesColorsValues): boolean {
  const legendItemSeriesKey = dataSeriesValues.colorValues;
  const legendItemSpecId = dataSeriesValues.specId;

  const geometrySeriesKey = geometryValue.seriesKey;
  const geometrySpecId = geometryValue.specId;

  const hasSameSpecId = legendItemSpecId === geometrySpecId;
  const hasSameSeriesKey = isEqualSeriesKey(legendItemSeriesKey, geometrySeriesKey);

  return hasSameSpecId && hasSameSeriesKey;
}
