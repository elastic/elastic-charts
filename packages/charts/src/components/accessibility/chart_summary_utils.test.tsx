/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createChartTypeDescription } from './chart_summary_utils';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { BasicSeriesSpec } from '../../chart_types/xy_chart/utils/specs';

describe('createChartTypeDescription', () => {
  const mockSeriesDomains = {
    formattedDataSeries: [
      {
        specId: 'series1',
        splitAccessors: new Map([['key', 'value1']]),
      },
      {
        specId: 'series2',
        splitAccessors: new Map([['key', 'value2']]),
      },
    ],
  } as SeriesDomainsAndData;

  const mockSeriesSpecs: BasicSeriesSpec[] = [
    {
      id: 'series1',
      seriesType: 'bar',
      name: 'Sales',
    } as BasicSeriesSpec,
    {
      id: 'series2',
      seriesType: 'bar',
      name: 'Revenue',
    } as BasicSeriesSpec,
  ];

  it('should return original description when no series specs or domains provided', () => {
    const result = createChartTypeDescription('simple chart');
    expect(result).toBe('simple chart');
  });

  it('should return original description when series domains has no formatted data', () => {
    const result = createChartTypeDescription('simple chart', mockSeriesSpecs, {} as SeriesDomainsAndData);
    expect(result).toBe('simple chart');
  });

  it('should create description for single series type with one series', () => {
    const singleSeriesDomains = {
      formattedDataSeries: [mockSeriesDomains.formattedDataSeries[0]],
    } as SeriesDomainsAndData;

    const singleSeriesSpecs = [mockSeriesSpecs[0]!];

    const result = createChartTypeDescription('chart', singleSeriesSpecs, singleSeriesDomains);
    expect(result).toBe('Bar chart');
  });

  it('should create description for single series type with multiple series', () => {
    const result = createChartTypeDescription('chart', mockSeriesSpecs, mockSeriesDomains);
    expect(result).toBe('Bar chart with 2 bars: Sales, Revenue');
  });

  it('should create description for single series type with many series (>5)', () => {
    const manySeriesSpecs = Array.from({ length: 6 }, (_, i) => ({
      id: `series${i + 1}`,
      seriesType: 'line',
      name: `Series ${i + 1}`,
    })) as BasicSeriesSpec[];

    const manySeriesDomains = {
      formattedDataSeries: manySeriesSpecs.map((spec) => ({
        specId: spec.id,
        splitAccessors: new Map(),
      })),
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', manySeriesSpecs, manySeriesDomains);
    expect(result).toBe('Line chart with 6 lines');
  });

  it('should create description for mixed series types', () => {
    const mixedSeriesSpecs = [
      { id: 'series1', seriesType: 'bar', name: 'Sales' },
      { id: 'series2', seriesType: 'line', name: 'Trend' },
    ] as BasicSeriesSpec[];

    const mixedSeriesDomains = {
      formattedDataSeries: [
        { specId: 'series1', splitAccessors: new Map() },
        { specId: 'series2', splitAccessors: new Map() },
      ],
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', mixedSeriesSpecs, mixedSeriesDomains);
    expect(result).toBe('Mixed chart: bar and line chart');
  });

  it('should handle stacked series', () => {
    const stackedSeriesSpecs = [
      {
        id: 'series1',
        seriesType: 'bar',
        name: 'Sales',
        stackAccessors: ['category'],
      },
    ] as BasicSeriesSpec[];

    const stackedSeriesDomains = {
      formattedDataSeries: [{ specId: 'series1', splitAccessors: new Map() }],
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', stackedSeriesSpecs, stackedSeriesDomains);
    expect(result).toBe('Stacked bar chart');
  });

  it('should handle percentage stacked series', () => {
    const percentageStackedSeriesSpecs = [
      {
        id: 'series1',
        seriesType: 'area',
        name: 'Sales',
        stackAccessors: ['category'],
        stackMode: 'percentage',
      } as any,
    ] as BasicSeriesSpec[];

    const percentageStackedSeriesDomains = {
      formattedDataSeries: [{ specId: 'series1', splitAccessors: new Map() }],
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', percentageStackedSeriesSpecs, percentageStackedSeriesDomains);
    expect(result).toBe('Percentage stacked area chart');
  });

  it('should handle stacked mixed series types', () => {
    const stackedMixedSeriesSpecs = [
      {
        id: 'series1',
        seriesType: 'bar',
        name: 'Sales',
        stackAccessors: ['category'],
      },
      {
        id: 'series2',
        seriesType: 'area',
        name: 'Revenue',
      },
    ] as BasicSeriesSpec[];

    const stackedMixedSeriesDomains = {
      formattedDataSeries: [
        { specId: 'series1', splitAccessors: new Map() },
        { specId: 'series2', splitAccessors: new Map() },
      ],
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', stackedMixedSeriesSpecs, stackedMixedSeriesDomains);
    expect(result).toBe('Stacked mixed chart: bar and area chart');
  });

  it('should handle series with split accessors', () => {
    const splitSeriesDomains = {
      formattedDataSeries: [
        {
          specId: 'series1',
          splitAccessors: new Map([
            ['region', 'North'],
            ['quarter', 'Q1'],
          ]),
        },
      ],
    } as SeriesDomainsAndData;

    const splitSeriesSpecs = [
      {
        id: 'series1',
        seriesType: 'line',
      },
    ] as BasicSeriesSpec[];

    const result = createChartTypeDescription('chart', splitSeriesSpecs, splitSeriesDomains);
    expect(result).toBe('Line chart');
  });

  it('should handle series without names', () => {
    const unnamedSeriesSpecs = [
      {
        id: 'series1',
        seriesType: 'bar',
      },
    ] as BasicSeriesSpec[];

    const unnamedSeriesDomains = {
      formattedDataSeries: [{ specId: 'series1', splitAccessors: new Map() }],
    } as SeriesDomainsAndData;

    const result = createChartTypeDescription('chart', unnamedSeriesSpecs, unnamedSeriesDomains);
    expect(result).toBe('Bar chart');
  });
});
