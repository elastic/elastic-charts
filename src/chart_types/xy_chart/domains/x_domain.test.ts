import { ScaleType } from '../../../scales';
import { getSplittedSeries } from '../utils/series';
import { BasicSeriesSpec, SeriesTypes } from '../utils/specs';
import { convertXScaleTypes, findMinInterval, mergeXDomain } from './x_domain';
import { ChartTypes } from '../..';
import { SpecTypes } from '../../../specs/settings';

describe('X Domain', () => {
  test('Should return null when missing specs or specs types', () => {
    const seriesSpecs: BasicSeriesSpec[] = [];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toBe(null);
  });

  test('should throw if we miss calling merge X domain without specs configured', () => {
    expect(() => {
      mergeXDomain([], new Set());
    }).toThrow();
  });

  test('Should return correct scale type with single bar', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      {
        seriesType: SeriesTypes.Bar,
        xScaleType: ScaleType.Linear,
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Linear,
      isBandScale: true,
    });
  });

  test('Should return correct scale type with single bar with Ordinal', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      {
        seriesType: SeriesTypes.Bar,
        xScaleType: ScaleType.Ordinal,
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Ordinal,
      isBandScale: true,
    });
  });

  test('Should return correct scale type with single area', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      {
        seriesType: SeriesTypes.Area,
        xScaleType: ScaleType.Linear,
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Linear,
      isBandScale: false,
    });
  });
  test('Should return correct scale type with single line (time)', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'timeZone'>[] = [
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Time,
        timeZone: 'utc-3',
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Time,
      isBandScale: false,
      timeZone: 'utc-3',
    });
  });
  test('Should return correct scale type with multi line with same scale types (time) same tz', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'timeZone'>[] = [
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Time,
        timeZone: 'UTC-3',
      },
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Time,
        timeZone: 'utc-3',
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Time,
      isBandScale: false,
      timeZone: 'utc-3',
    });
  });
  test('Should return correct scale type with multi line with same scale types (time) coerce to UTC', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'timeZone'>[] = [
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Time,
        timeZone: 'utc-3',
      },
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Time,
        timeZone: 'utc+3',
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Time,
      isBandScale: false,
      timeZone: 'utc',
    });
  });

  test('Should return correct scale type with multi line with different scale types (linear, ordinal)', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Linear,
      },
      {
        seriesType: SeriesTypes.Line,
        xScaleType: ScaleType.Ordinal,
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Ordinal,
      isBandScale: false,
    });
  });
  test('Should return correct scale type with multi bar, area with different scale types (linear, ordinal)', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      {
        seriesType: SeriesTypes.Bar,
        xScaleType: ScaleType.Linear,
      },
      {
        seriesType: SeriesTypes.Area,
        xScaleType: ScaleType.Ordinal,
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Ordinal,
      isBandScale: true,
    });
  });
  test('Should return correct scale type with multi bar, area with same scale types (linear, linear)', () => {
    const seriesSpecs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType' | 'timeZone'>[] = [
      {
        seriesType: SeriesTypes.Bar,
        xScaleType: ScaleType.Linear,
      },
      {
        seriesType: SeriesTypes.Area,
        xScaleType: ScaleType.Time,
        timeZone: 'utc+3',
      },
    ];
    const mainXScale = convertXScaleTypes(seriesSpecs);
    expect(mainXScale).toEqual({
      scaleType: ScaleType.Linear,
      isBandScale: true,
    });
  });

  test('Should merge line series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g1',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries: BasicSeriesSpec[] = [ds1, ds2];
    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Linear,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 7]);
  });
  test('Should merge bar series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 7]);
  });
  test('Should merge multi bar series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 7]);
  });
  test('Should merge multi bar series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 7]);
  });
  test('Should merge multi bar linear/bar ordinal series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Ordinal,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 1, 2, 5, 7]);
  });
  test('Should merge multi bar/line ordinal series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Linear,
        },
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Ordinal,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 1, 2, 5, 7]);
  });
  test('Should merge multi bar/line time series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Bar,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Bar,
          xScaleType: ScaleType.Ordinal,
        },
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Time,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 1, 2, 5, 7]);
  });
  test('Should merge multi lines series correctly', () => {
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ],
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ],
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);
    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Ordinal,
        },
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Linear,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain).toEqual([0, 1, 2, 5, 7]);
  });

  test('Should merge X multi high volume of data', () => {
    const maxValues = 10000;
    const ds1: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds1',
      groupId: 'g1',
      seriesType: SeriesTypes.Area,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Linear,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: new Array(maxValues).fill(0).map((d, i) => ({ x: i, y: i })),
    };
    const ds2: BasicSeriesSpec = {
      chartType: ChartTypes.XYAxis,
      specType: SpecTypes.Series,
      id: 'ds2',
      groupId: 'g2',
      seriesType: SeriesTypes.Line,
      xAccessor: 'x',
      yAccessors: ['y'],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      yScaleToDataExtent: false,
      data: new Array(maxValues).fill(0).map((d, i) => ({ x: i, y: i })),
    };
    const specDataSeries = [ds1, ds2];

    const { xValues } = getSplittedSeries(specDataSeries);

    const mergedDomain = mergeXDomain(
      [
        {
          seriesType: SeriesTypes.Area,
          xScaleType: ScaleType.Linear,
        },
        {
          seriesType: SeriesTypes.Line,
          xScaleType: ScaleType.Ordinal,
        },
      ],
      xValues,
    );
    expect(mergedDomain.domain.length).toEqual(maxValues);
  });
  test('should compute minInterval an ordered list of numbers', () => {
    const minInterval = findMinInterval([0, 1, 2, 3, 4, 5]);
    expect(minInterval).toBe(1);
  });
  test('should compute minInterval an unordered list of numbers', () => {
    const minInterval = findMinInterval([2, 10, 3, 1, 5]);
    expect(minInterval).toBe(1);
  });
  test('should compute minInterval an list grether than 9', () => {
    const minInterval = findMinInterval([0, 2, 4, 6, 8, 10, 20, 30, 40, 50, 80]);
    expect(minInterval).toBe(2);
  });
  test('should compute minInterval an list with negative numbers', () => {
    const minInterval = findMinInterval([-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12]);
    expect(minInterval).toBe(1);
  });
  test('should compute minInterval an list with negative and positive numbers', () => {
    const minInterval = findMinInterval([-2, -4, -6, -8, -10, -12, 0, 2, 4, 6, 8, 10, 12]);
    expect(minInterval).toBe(2);
  });
  test('should compute minInterval a single element array', () => {
    const minInterval = findMinInterval([100]);
    expect(minInterval).toBe(1);
  });
  test('should compute minInterval a empty element array', () => {
    const minInterval = findMinInterval([]);
    expect(minInterval).toBe(0);
  });
  test('should account for custom domain when merging a linear domain: complete bounded domain', () => {
    const xValues = new Set([1, 2, 3, 4, 5]);
    const xDomain = { min: 0, max: 3 };
    const specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      { seriesType: SeriesTypes.Line, xScaleType: ScaleType.Linear },
    ];

    const basicMergedDomain = mergeXDomain(specs, xValues, xDomain);
    expect(basicMergedDomain.domain).toEqual([0, 3]);

    const arrayXDomain = [1, 2];
    const attemptToMergeArrayDomain = () => {
      mergeXDomain(specs, xValues, arrayXDomain);
    };
    const errorMessage = 'xDomain for continuous scale should be a DomainRange object, not an array';
    expect(attemptToMergeArrayDomain).toThrowError(errorMessage);

    const invalidXDomain = { min: 10, max: 0 };
    const attemptToMerge = () => {
      mergeXDomain(specs, xValues, invalidXDomain);
    };
    expect(attemptToMerge).toThrowError('custom xDomain is invalid, min is greater than max');
  });

  test('should account for custom domain when merging a linear domain: lower bounded domain', () => {
    const xValues = new Set([1, 2, 3, 4, 5]);
    const xDomain = { min: 0 };
    const specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      { seriesType: SeriesTypes.Line, xScaleType: ScaleType.Linear },
    ];

    const mergedDomain = mergeXDomain(specs, xValues, xDomain);
    expect(mergedDomain.domain).toEqual([0, 5]);

    const invalidXDomain = { min: 10 };
    const attemptToMerge = () => {
      mergeXDomain(specs, xValues, invalidXDomain);
    };
    expect(attemptToMerge).toThrowError('custom xDomain is invalid, custom min is greater than computed max');
  });

  test('should account for custom domain when merging a linear domain: upper bounded domain', () => {
    const xValues = new Set([1, 2, 3, 4, 5]);
    const xDomain = { max: 3 };
    const specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      { seriesType: SeriesTypes.Line, xScaleType: ScaleType.Linear },
    ];

    const mergedDomain = mergeXDomain(specs, xValues, xDomain);
    expect(mergedDomain.domain).toEqual([1, 3]);

    const invalidXDomain = { max: -1 };
    const attemptToMerge = () => {
      mergeXDomain(specs, xValues, invalidXDomain);
    };
    expect(attemptToMerge).toThrowError('custom xDomain is invalid, computed min is greater than custom max');
  });

  test('should account for custom domain when merging an ordinal domain', () => {
    const xValues = new Set(['a', 'b', 'c', 'd']);
    const xDomain = ['a', 'b', 'c'];
    const specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      { seriesType: SeriesTypes.Bar, xScaleType: ScaleType.Ordinal },
    ];
    const basicMergedDomain = mergeXDomain(specs, xValues, xDomain);
    expect(basicMergedDomain.domain).toEqual(['a', 'b', 'c']);

    const objectXDomain = { max: 10, min: 0 };
    const attemptToMerge = () => {
      mergeXDomain(specs, xValues, objectXDomain);
    };
    const errorMessage = 'xDomain for ordinal scale should be an array of values, not a DomainRange object';
    expect(attemptToMerge).toThrowError(errorMessage);
  });

  describe('should account for custom minInterval', () => {
    const xValues = new Set([1, 2, 3, 4, 5]);
    const specs: Pick<BasicSeriesSpec, 'seriesType' | 'xScaleType'>[] = [
      { seriesType: SeriesTypes.Bar, xScaleType: ScaleType.Linear },
    ];

    test('with valid minInterval', () => {
      const xDomain = { minInterval: 0.5 };
      const mergedDomain = mergeXDomain(specs, xValues, xDomain);
      expect(mergedDomain.minInterval).toEqual(0.5);
    });

    test('with valid minInterval greater than computed minInterval for single datum set', () => {
      const xDomain = { minInterval: 10 };
      const mergedDomain = mergeXDomain(specs, new Set([5]), xDomain);
      expect(mergedDomain.minInterval).toEqual(10);
    });

    test('with invalid minInterval greater than computed minInterval for multi data set', () => {
      const invalidXDomain = { minInterval: 10 };
      const attemptToMerge = () => {
        mergeXDomain(specs, xValues, invalidXDomain);
      };
      const expectedError = 'custom xDomain is invalid, custom minInterval is greater than computed minInterval';
      expect(attemptToMerge).toThrowError(expectedError);
    });

    test('with invalid minInterval less than 0', () => {
      const invalidXDomain = { minInterval: -1 };
      const attemptToMerge = () => {
        mergeXDomain(specs, xValues, invalidXDomain);
      };
      const expectedError = 'custom xDomain is invalid, custom minInterval is less than 0';
      expect(attemptToMerge).toThrowError(expectedError);
    });
  });
});
