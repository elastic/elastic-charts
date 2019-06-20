import { getSpecId } from '../utils/ids';
import { GeometryId } from './rendering';
import { DataSeriesValues } from './series';
import { belongsToDataSeries, isArrayEqual } from './series_utils';

describe('Series utility functions', () => {
  test('can compare series keys for identity', () => {
    const seriesKeyA = ['a', 'b', 'c'];
    const seriesKeyB = ['a', 'b', 'c'];
    const seriesKeyC = ['a', 'b', 'd'];
    const seriesKeyD = ['d'];
    const seriesKeyE = ['b', 'a', 'c'];

    expect(isArrayEqual(seriesKeyA, seriesKeyB)).toBe(true);
    expect(isArrayEqual(seriesKeyB, seriesKeyC)).toBe(false);
    expect(isArrayEqual(seriesKeyA, seriesKeyD)).toBe(false);
    expect(isArrayEqual(seriesKeyA, seriesKeyE)).toBe(false);
    expect(isArrayEqual(seriesKeyA, [])).toBe(false);
  });

  test('can determine if a geometry id belongs to a data series', () => {
    const geometryIdA: GeometryId = {
      specId: getSpecId('a'),
      seriesKey: ['a', 'b', 'c'],
    };

    const dataSeriesValuesA: DataSeriesValues = {
      specId: getSpecId('a'),
      colorValues: ['a', 'b', 'c'],
    };

    const dataSeriesValuesB: DataSeriesValues = {
      specId: getSpecId('b'),
      colorValues: ['a', 'b', 'c'],
    };

    const dataSeriesValuesC: DataSeriesValues = {
      specId: getSpecId('a'),
      colorValues: ['a', 'b', 'd'],
    };

    expect(belongsToDataSeries(geometryIdA, dataSeriesValuesA)).toBe(true);
    expect(belongsToDataSeries(geometryIdA, dataSeriesValuesB)).toBe(false);
    expect(belongsToDataSeries(geometryIdA, dataSeriesValuesC)).toBe(false);
  });
});
