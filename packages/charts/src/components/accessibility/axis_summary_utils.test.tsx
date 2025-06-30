/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAxisDescriptions } from './axis_summary_utils';
import { Position } from '../../utils/common';
import type { SeriesDomainsAndData } from '../../chart_types/xy_chart/state/utils/types';
import type { AxisSpec } from '../../chart_types/xy_chart/utils/specs';

describe('createAxisDescriptions', () => {
  const mockXAxisSpec: AxisSpec = {
    id: 'x-axis',
    position: Position.Bottom,
    title: 'Time',
  } as AxisSpec;

  const mockYAxisSpec: AxisSpec = {
    id: 'y-axis',
    position: Position.Left,
    title: 'Values',
  } as AxisSpec;

  it('should create X axis description for ordinal domain', () => {
    const seriesDomains = {
      xDomain: {
        type: 'ordinal',
        domain: ['A', 'B', 'C', 'D', 'E'],
      },
      yDomains: [],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockXAxisSpec], seriesDomains);
    expect(result).toEqual(['X axis displays Time with 5 categories']);
  });

  it('should create X axis description for linear domain', () => {
    const seriesDomains = {
      xDomain: {
        type: 'linear',
        domain: [0, 100],
      },
      yDomains: [],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockXAxisSpec], seriesDomains);
    expect(result).toEqual(['X axis displays Time from 0 to 100']);
  });

  it('should create X axis description for time domain with less than 1 day span', () => {
    const startTime = new Date('2023-01-01T08:00:00Z').getTime();
    const endTime = new Date('2023-01-01T16:00:00Z').getTime();
    
    const seriesDomains = {
      xDomain: {
        type: 'time',
        domain: [startTime, endTime],
      },
      yDomains: [],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockXAxisSpec], seriesDomains);
    expect(result[0]).toContain('X axis displays Time from');
    expect(result[0]).toContain('Jan 1');
    expect(result[0]).toContain('AM to Jan 1');
    expect(result[0]).toContain('PM');
  });

  it('should create Y axis description for single axis', () => {
    const seriesDomains = {
      xDomain: null,
      yDomains: [
        {
          domain: [0, 100],
        },
      ],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockYAxisSpec], seriesDomains);
    expect(result).toEqual(['Y axis displays Values, ranging from 0 to 100']);
  });

  it('should create Y axis description for multiple axes', () => {
    const multipleYAxisSpecs = [
      mockYAxisSpec,
      {
        id: 'y-axis-2',
        position: Position.Right,
        title: 'Secondary Values',
      } as AxisSpec,
    ];

    const seriesDomains = {
      xDomain: null,
      yDomains: [
        {
          domain: [0, 100],
        },
      ],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions(multipleYAxisSpecs, seriesDomains);
    expect(result).toEqual(['2 Y axes, ranging from 0 to 100']);
  });

  it('should create both X and Y axis descriptions', () => {
    const seriesDomains = {
      xDomain: {
        type: 'ordinal',
        domain: ['A', 'B', 'C'],
      },
      yDomains: [
        {
          domain: [0, 50],
        },
      ],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockXAxisSpec, mockYAxisSpec], seriesDomains);
    expect(result).toEqual([
      'X axis displays Time with 3 categories',
      'Y axis displays Values, ranging from 0 to 50',
    ]);
  });

  it('should use default titles when axis titles are not provided', () => {
    const axisWithoutTitle: AxisSpec = {
      id: 'x-axis',
      position: Position.Bottom,
    } as AxisSpec;

    const seriesDomains = {
      xDomain: {
        type: 'linear',
        domain: [1, 10],
      },
      yDomains: [],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([axisWithoutTitle], seriesDomains);
    expect(result).toEqual(['X axis displays X from 1 to 10']);
  });

  it('should skip axes when domains are not available', () => {
    const seriesDomains = {
      xDomain: null,
      yDomains: [],
    } as unknown as SeriesDomainsAndData;

    const result = createAxisDescriptions([mockXAxisSpec, mockYAxisSpec], seriesDomains);
    expect(result).toEqual([]);
  });
});