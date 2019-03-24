import { DataSeriesColorsValues } from '../lib/series/series';
import {
  AreaSeriesSpec,
  BarSeriesSpec,
  BasicSeriesSpec,
  LineSeriesSpec,
} from '../lib/series/specs';

import { BARCHART_1Y0G, BARCHART_1Y1G, BARCHART_2Y2G } from '../lib/series/utils/test_dataset';

import { getGroupId, getSpecId, SpecId } from '../lib/utils/ids';
import { ScaleType } from '../lib/utils/scales/scales';
import {
  computeSeriesDomains,
  findSelectedDataSeries,
  getAllDataSeriesColorValues,
  getUpdatedCustomSeriesColors,
  hasSeriesColorsChanged,
  isHorizontalRotation,
  isLineAreaOnlyChart,
  isVerticalRotation,
  updateSelectedDataSeries,
} from './utils';

describe('Chart State utils', () => {
  it('should compute and format specifications for non stacked chart', () => {
    const spec1: BasicSeriesSpec = {
      id: getSpecId('spec1'),
      groupId: getGroupId('group1'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y0G,
    };
    const spec2: BasicSeriesSpec = {
      id: getSpecId('spec2'),
      groupId: getGroupId('group2'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y0G,
    };
    const specs = new Map<SpecId, BasicSeriesSpec>();
    specs.set(spec1.id, spec1);
    specs.set(spec2.id, spec2);
    const domains = computeSeriesDomains(specs, new Map(), undefined);
    expect(domains.xDomain).toEqual({
      domain: [0, 3],
      isBandScale: false,
      scaleType: ScaleType.Linear,
      minInterval: 1,
      type: 'xDomain',
    });
    expect(domains.yDomain).toEqual([
      {
        domain: [0, 10],
        scaleType: ScaleType.Log,
        groupId: 'group1',
        isBandScale: false,
        type: 'yDomain',
      },
      {
        domain: [0, 10],
        scaleType: ScaleType.Log,
        groupId: 'group2',
        isBandScale: false,
        type: 'yDomain',
      },
    ]);
    expect(domains.formattedDataSeries.stacked).toEqual([]);
    expect(domains.formattedDataSeries.nonStacked).toMatchSnapshot();
  });
  it('should compute and format specifications for stacked chart', () => {
    const spec1: BasicSeriesSpec = {
      id: getSpecId('spec1'),
      groupId: getGroupId('group1'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y1G,
    };
    const spec2: BasicSeriesSpec = {
      id: getSpecId('spec2'),
      groupId: getGroupId('group2'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      stackAccessors: ['x'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y1G,
    };
    const specs = new Map<SpecId, BasicSeriesSpec>();
    specs.set(spec1.id, spec1);
    specs.set(spec2.id, spec2);
    const domains = computeSeriesDomains(specs, new Map(), undefined);
    expect(domains.xDomain).toEqual({
      domain: [0, 3],
      isBandScale: false,
      scaleType: ScaleType.Linear,
      minInterval: 1,
      type: 'xDomain',
    });
    expect(domains.yDomain).toEqual([
      {
        domain: [0, 5],
        scaleType: ScaleType.Log,
        groupId: 'group1',
        isBandScale: false,
        type: 'yDomain',
      },
      {
        domain: [0, 9],
        scaleType: ScaleType.Log,
        groupId: 'group2',
        isBandScale: false,
        type: 'yDomain',
      },
    ]);
    expect(domains.formattedDataSeries.stacked).toMatchSnapshot();
    expect(domains.formattedDataSeries.nonStacked).toMatchSnapshot();
  });
  it('should check if a DataSeriesColorValues item exists in a list of DataSeriesColorValues', () => {
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

    const selectedSeries = [dataSeriesValuesA, dataSeriesValuesB];

    expect(findSelectedDataSeries(selectedSeries, dataSeriesValuesA)).toBe(0);
    expect(findSelectedDataSeries(selectedSeries, dataSeriesValuesC)).toBe(-1);
    expect(findSelectedDataSeries(null, dataSeriesValuesA)).toBe(-1);
  });
  it('should update a list of DataSeriesColorsValues given a selected DataSeriesColorValues item', () => {
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

    const selectedSeries = [dataSeriesValuesA, dataSeriesValuesB];
    const addedSelectedSeries = [dataSeriesValuesA, dataSeriesValuesB, dataSeriesValuesC];
    const removedSelectedSeries = [dataSeriesValuesB];

    expect(updateSelectedDataSeries(selectedSeries, dataSeriesValuesC)).toEqual(
      addedSelectedSeries,
    );
    expect(updateSelectedDataSeries(selectedSeries, dataSeriesValuesA)).toEqual(
      removedSelectedSeries,
    );
    expect(updateSelectedDataSeries(null, dataSeriesValuesA)).toEqual([dataSeriesValuesA]);
  });
  it('should return all of the DataSeriesColorValues on initialization', () => {
    const dataSeriesValuesA: DataSeriesColorsValues = {
      specId: getSpecId('a'),
      colorValues: ['a', 'b', 'c'],
    };

    const dataSeriesValuesB: DataSeriesColorsValues = {
      specId: getSpecId('b'),
      colorValues: ['a', 'b', 'c'],
    };

    const colorMap = new Map();
    colorMap.set('a', dataSeriesValuesA);
    colorMap.set('b', dataSeriesValuesB);

    const expected = [dataSeriesValuesA, dataSeriesValuesB];

    expect(getAllDataSeriesColorValues(colorMap)).toEqual(expected);
  });
  it('should get an updated customSeriesColor based on specs', () => {
    const spec1: BasicSeriesSpec = {
      id: getSpecId('spec1'),
      groupId: getGroupId('group1'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y0G,
    };

    const specs = new Map<SpecId, BasicSeriesSpec>();
    specs.set(spec1.id, spec1);

    const emptyCustomSeriesColors = getUpdatedCustomSeriesColors(specs);
    expect(emptyCustomSeriesColors).toEqual(new Map());

    const dataSeriesColorValues = {
      specId: spec1.id,
      colorValues: ['bar'],
    };
    spec1.customSeriesColors = new Map();
    spec1.customSeriesColors.set(dataSeriesColorValues, 'custom_color');

    const updatedCustomSeriesColors = getUpdatedCustomSeriesColors(specs);
    const expectedCustomSeriesColors = new Map();
    expectedCustomSeriesColors.set('specId:{spec1},colors:{bar}', 'custom_color');

    expect(updatedCustomSeriesColors).toEqual(expectedCustomSeriesColors);
  });

  test('is horizontal chart rotation', () => {
    expect(isHorizontalRotation(0)).toBe(true);
    expect(isHorizontalRotation(180)).toBe(true);
    expect(isHorizontalRotation(-90)).toBe(false);
    expect(isHorizontalRotation(90)).toBe(false);
    expect(isVerticalRotation(-90)).toBe(true);
    expect(isVerticalRotation(90)).toBe(true);
    expect(isVerticalRotation(0)).toBe(false);
    expect(isVerticalRotation(180)).toBe(false);
  });

  test('is vertical chart rotation', () => {
    expect(isVerticalRotation(-90)).toBe(true);
    expect(isVerticalRotation(90)).toBe(true);
    expect(isVerticalRotation(0)).toBe(false);
    expect(isVerticalRotation(180)).toBe(false);
  });
  test('is an area or line only map', () => {
    const area: AreaSeriesSpec = {
      id: getSpecId('area'),
      groupId: getGroupId('group1'),
      seriesType: 'area',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y1G,
    };
    const line: LineSeriesSpec = {
      id: getSpecId('line'),
      groupId: getGroupId('group2'),
      seriesType: 'line',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      stackAccessors: ['x'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y1G,
    };
    const bar: BarSeriesSpec = {
      id: getSpecId('bar'),
      groupId: getGroupId('group2'),
      seriesType: 'bar',
      yScaleType: ScaleType.Log,
      xScaleType: ScaleType.Linear,
      xAccessor: 'x',
      yAccessors: ['y'],
      splitSeriesAccessors: ['g'],
      stackAccessors: ['x'],
      yScaleToDataExtent: false,
      data: BARCHART_1Y1G,
    };
    let seriesMap = new Map<SpecId, BasicSeriesSpec>([
      [area.id, area],
      [line.id, line],
      [bar.id, bar],
    ]);
    expect(isLineAreaOnlyChart(seriesMap)).toBe(false);
    seriesMap = new Map<SpecId, BasicSeriesSpec>([[area.id, area], [line.id, line]]);
    expect(isLineAreaOnlyChart(seriesMap)).toBe(true);
    seriesMap = new Map<SpecId, BasicSeriesSpec>([[area.id, area]]);
    expect(isLineAreaOnlyChart(seriesMap)).toBe(true);
    seriesMap = new Map<SpecId, BasicSeriesSpec>([[line.id, line]]);
    expect(isLineAreaOnlyChart(seriesMap)).toBe(true);
    seriesMap = new Map<SpecId, BasicSeriesSpec>([[bar.id, bar], [getSpecId('bar2'), bar]]);
    expect(isLineAreaOnlyChart(seriesMap)).toBe(false);
  });
  test('should detect when series colors have changed', () => {
    const specId = getSpecId('spec_1');
    const groupId = getGroupId('group_1');

    const spec1: BarSeriesSpec = {
      id: specId,
      groupId,
      seriesType: 'bar',
      yScaleToDataExtent: false,
      data: BARCHART_2Y2G,
      xAccessor: 'x',
      yAccessors: ['y1', 'y2'],
      splitSeriesAccessors: ['g1'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
    };

    const prevSeriesSpecs = new Map();
    const prevSeriesColors = new Map();

    const hasChangedSize = hasSeriesColorsChanged(
      prevSeriesColors,
      prevSeriesSpecs,
      null,
      spec1,
    );
    expect(hasChangedSize).toBe(true);

    prevSeriesSpecs.set(spec1.id, spec1);
    const seriesColors1 = {
      specId,
      colorValues: ['cdn.google.com', 'y1'],
    };
    prevSeriesColors.set('specId:{spec_1},colors:{cdn.google.com,y1}', seriesColors1);

    const seriesColors2 = {
      specId,
      colorValues: ['cloudflare.com', 'y1'],
    };
    prevSeriesColors.set('specId:{spec_1},colors:{cloudflare.com,y1}', seriesColors2);

    const seriesColors3 = {
      specId,
      colorValues: ['cdn.google.com', 'y2'],
    };
    prevSeriesColors.set('specId:{spec_1},colors:{cdn.google.com,y2}', seriesColors3);

    const seriesColors4 = {
      specId,
      colorValues: ['cloudflare.com', 'y2'],
    };
    prevSeriesColors.set('specId:{spec_1},colors:{cloudflare.com,y2}', seriesColors4);

    const changedXAccessorSpec: BarSeriesSpec = { ...spec1, xAccessor: 'y2' };
    const hasChangedXAccessor = hasSeriesColorsChanged(
      prevSeriesColors,
      prevSeriesSpecs,
      null,
      changedXAccessorSpec,
    );
    expect(hasChangedXAccessor).toBe(false);

    const changedYAccessorSpec: BarSeriesSpec = { ...spec1, yAccessors: ['y2'] };
    const hasChangedYAccessor = hasSeriesColorsChanged(
      prevSeriesColors,
      prevSeriesSpecs,
      null,
      changedYAccessorSpec,
    );
    expect(hasChangedYAccessor).toBe(true);

    const changedSplitAccessorSpec: BarSeriesSpec = { ...spec1, splitSeriesAccessors: ['g2'] };
    const hasChangedSplitAccessor = hasSeriesColorsChanged(
      prevSeriesColors,
      prevSeriesSpecs,
      null,
      changedSplitAccessorSpec,
    );
    expect(hasChangedSplitAccessor).toBe(true);

    const additionalSplitData = [...BARCHART_2Y2G, { x: 0, g1: 'foo', g2: 'direct-cdn', y1: 1, y2: 4 }];
    const changedDataValuesSpec: BarSeriesSpec = { ...spec1, data: additionalSplitData };
    const hasChangedDataValues = hasSeriesColorsChanged(
      prevSeriesColors,
      prevSeriesSpecs,
      null,
      changedDataValuesSpec,
    );
    expect(hasChangedDataValues).toBe(true);
  });
});
