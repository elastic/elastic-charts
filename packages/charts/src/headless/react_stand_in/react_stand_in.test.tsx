/**
 * @jest-environment node
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type * as ReactModule from 'react';

import type * as HeadlessModule from '..';
import type * as ChartsModule from '../..';

type Charts = typeof ChartsModule;
type Datum = ChartsModule.Datum;
type MakeElement = typeof ReactModule.createElement;

const rows = [
  { x: 0, y: 2, g: 'a' },
  { x: 1, y: 7, g: 'b' },
  { x: 2, y: 3, g: 'a' },
  { x: 3, y: 6, g: 'b' },
];
const size = { width: 400, height: 240 };

/** Each chart is made from the React and the Charts that one run loaded */
const charts: Record<string, (h: MakeElement, c: Charts) => JSX.Element> = {
  'bars, axes and a legend': (h, { Chart, Settings, Axis, BarSeries, Position, ScaleType }) =>
    h(
      Chart,
      { id: 'bars', size },
      h(Settings, { showLegend: true, legendPosition: Position.Right }),
      h(Axis, { id: 'bottom', position: Position.Bottom, title: 'x & <y>' }),
      h(Axis, { id: 'left', position: Position.Left }),
      h(BarSeries, {
        id: 'series',
        xScaleType: ScaleType.Linear,
        xAccessor: 'x',
        yAccessors: ['y'],
        splitSeriesAccessors: ['g'],
        data: rows,
      }),
    ),
  'a line and an area': (h, { Chart, Axis, LineSeries, AreaSeries, Position, ScaleType }) =>
    h(
      Chart,
      { id: 'lines', size },
      h(Axis, { id: 'left', position: Position.Left }),
      h(LineSeries, { id: 'line', xScaleType: ScaleType.Linear, xAccessor: 'x', yAccessors: ['y'], data: rows }),
      h(AreaSeries, { id: 'area', xScaleType: ScaleType.Linear, xAccessor: 'x', yAccessors: ['y'], data: rows }),
    ),
  'a sunburst with a legend': (h, { Chart, Settings, Partition, PartitionLayout }) =>
    h(
      Chart,
      { id: 'sunburst', size },
      h(Settings, { showLegend: true }),
      h(Partition, {
        id: 'slices',
        data: rows,
        layout: PartitionLayout.sunburst,
        valueAccessor: (d: Datum) => d.y,
        layers: [{ groupByRollup: (d: Datum) => d.g }],
      }),
    ),
  'a heatmap': (h, { Chart, Heatmap }) =>
    h(
      Chart,
      { id: 'heatmap', size },
      h(Heatmap, {
        id: 'cells',
        data: rows,
        xAccessor: 'x',
        yAccessor: 'g',
        valueAccessor: 'y',
        colorScale: { type: 'bands', bands: [{ start: 0, end: 10, color: 'teal' }] },
      }),
    ),
  'a metric': (h, { Chart, Metric }) =>
    h(
      Chart,
      { id: 'metric', size },
      h(Metric, {
        id: 'tiles',
        data: [[{ color: 'teal', title: 'Total', value: 42, valueFormatter: (value: number) => `${value}` }]],
      }),
    ),
};

/** The markup of every chart, from a fresh load of Charts with real React or with the stand-in */
const markups = (standIn: boolean) => {
  const result: Record<string, string> = {};
  let reactVersion = '';
  jest.isolateModules(() => {
    if (standIn) {
      jest.doMock('react', () => jest.requireActual('./react'));
      jest.doMock('react-dom', () => jest.requireActual('./react_dom'));
      jest.doMock('react-dom/server', () => jest.requireActual('./server'));
      jest.doMock('react-redux', () => jest.requireActual('./react_redux'));
    }
    try {
      /* eslint-disable @typescript-eslint/no-var-requires, global-require */
      const { createElement, version } = require('react') as typeof ReactModule;
      const all = require('../..') as Charts;
      const { renderChart } = require('..') as typeof HeadlessModule;
      /* eslint-enable @typescript-eslint/no-var-requires, global-require */
      reactVersion = version;
      for (const [name, chart] of Object.entries(charts)) result[name] = renderChart(chart(createElement, all));
    } finally {
      ['react', 'react-dom', 'react-dom/server', 'react-redux'].forEach((name) => jest.dontMock(name));
    }
  });
  return { reactVersion, result };
};

describe('the stand-in for React, in a headless render', () => {
  const withReact = markups(false);
  const withStandIn = markups(true);

  it('is what the charts were rendered with', () => {
    expect(withReact.reactVersion).toBe('18.3.1');
    expect(withStandIn.reactVersion).toBe('18.3.1-static-shim');
  });

  it.each(Object.keys(charts))('writes the markup that React writes for %s', (name) => {
    expect(withReact.result[name]).toContain('class="echChart"');
    expect(withStandIn.result[name]).toBe(withReact.result[name]);
  });
});
