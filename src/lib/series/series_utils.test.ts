import { getSpecId } from '../utils/ids';
import { GeometryValue } from './rendering';
import { DataSeriesColorsValues } from './series';
import { belongsToDataSeries, isEqualSeriesKey } from './series_utils';

describe('Series utility functions', () => {
  test('can compare series keys for identity', () => {
    const seriesKeyA = ['a', 'b', 'c'];
    const seriesKeyB = ['a', 'b', 'c'];
    const seriesKeyC = ['a', 'b', 'd'];
    const seriesKeyD = ['d'];
    const seriesKeyE = ['b', 'a', 'c'];

    expect(isEqualSeriesKey(seriesKeyA, seriesKeyB)).toBe(true);
    expect(isEqualSeriesKey(seriesKeyB, seriesKeyC)).toBe(false);
    expect(isEqualSeriesKey(seriesKeyA, seriesKeyD)).toBe(false);
    expect(isEqualSeriesKey(seriesKeyA, seriesKeyE)).toBe(false);
    expect(isEqualSeriesKey(seriesKeyA, [])).toBe(false);
  });

  test('can determine if a geometry value belongs to a data series', () => {
    const geometryValueA: GeometryValue = {
      specId: getSpecId('a'),
      datum: null,
      seriesKey: ['a', 'b', 'c'],
    };

    const dataSeriesValuesA: DataSeriesColorsValues = {
      specId: getSpecId('a'),
      colorValues: ['a', 'b', 'c'],
    };

    const dataSeriesValuesB: DataSeriesColorsValues = {
      specId: getSpecId('b'),
      colorValues: ['a', 'b', 'c'],
    };

    const dataSeriesValuesC: DataSeriesColorsValues = {
      specId: getSpecId('a'),
      colorValues: ['a', 'b', 'd'],
    };

    expect(belongsToDataSeries(geometryValueA, dataSeriesValuesA)).toBe(true);
    expect(belongsToDataSeries(geometryValueA, dataSeriesValuesB)).toBe(false);
    expect(belongsToDataSeries(geometryValueA, dataSeriesValuesC)).toBe(false);
  });
});
