/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, createGlyphFont, renderChart, SvgCanvas } from '.';
import { PartitionLayout } from '../chart_types/partition_chart/layout/types/config_types';
import { LegendValue } from '../common/legend';
import { Partition, Settings } from '../specs';
import type { SettingsProps } from '../specs';
import type { Datum } from '../utils/common';
import { Position } from '../utils/common';
import type { PartialTheme } from '../utils/themes/theme';

const WIDTH = 600;
const HEIGHT = 300;
const COLORS = ['#16C5C0', '#61A2FF', '#EE72A6', '#F6726A'];

const requests = [
  { os: 'win', response: '200', count: 400 },
  { os: 'win', response: '404', count: 100 },
  { os: 'osx', response: '200', count: 300 },
  { os: 'osx', response: '404', count: 50 },
  { os: 'linux', response: '200', count: 150 },
];

const layer = (accessor: string) => ({
  groupByRollup: (d: Datum) => d[accessor],
  nodeLabel: (d: unknown) => String(d),
  shape: {
    fillColor: (key: unknown) => COLORS[['win', 'osx', 'linux', '200', '404'].indexOf(String(key)) % 4] ?? '#000',
  },
});

// A test font with a 500 x 500 unit box for every character the charts below draw.
const font = createGlyphFont({
  family: 'Test',
  faces: [
    {
      weight: 400,
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: Object.fromEntries(
        [...'abcdefghijklmnopqrstuvwxyz0123456789 '].map((char): [string, [number, string]] => [
          char,
          [600, char === ' ' ? '' : 'M50 0H550V500H50Z'],
        ]),
      ),
    },
  ],
});

const renderToSvg = (element: React.ReactElement, withFont = false) => {
  const svg = new SvgCanvas(WIDTH, HEIGHT, withFont ? { font } : {});
  renderChart({ specs: collectSpecs(element), width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D });
  return svg.toSvg();
};

const partitionChart = (
  layout: PartitionLayout,
  accessors: string[],
  theme: PartialTheme = {},
  showLegend = false,
  legend: Partial<SettingsProps> = {},
) =>
  renderToSvg(
    <>
      <Settings showLegend={showLegend} legendPosition={Position.Right} theme={theme} {...legend} />
      <Partition
        id="requests"
        data={requests}
        layout={layout}
        valueAccessor={(d: Datum) => d.count}
        valueFormatter={(value: number) => `${value} req`}
        layers={accessors.map(layer)}
      />
    </>,
  );

const textContents = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text]) => text);
const filledPaths = (svg: string, color: string) => svg.match(new RegExp(`<path [^>]*fill="${color}"`, 'g')) ?? [];
// Arc commands draw the sectors of pies and donuts; rectangles use only lines.
const arcPaths = (svg: string) => svg.match(/<path d="[^"]*A[^"]*" fill="(?!none)/g) ?? [];
const firstPoint = (svg: string) => /<path d="M([\d.]+) ([\d.]+)/.exec(svg)?.slice(1).map(Number) ?? [];
// The legend is drawn untransformed, unlike the chart's labels.
const legendX = (svg: string, label: string) =>
  Number(new RegExp(`matrix\\(1 0 0 1 0 0\\)" x="([\\d.]+)"[^>]*>${label}<`).exec(svg)?.[1]);

describe('Headless partition rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('draws a pie with one slice per category and value labels', () => {
    const svg = partitionChart(PartitionLayout.sunburst, ['os']);

    expect(arcPaths(svg)).toHaveLength(3);
    expect(filledPaths(svg, COLORS[0]!)).toHaveLength(1);
    expect(textContents(svg)).toEqual(expect.arrayContaining(['win', '500 req', 'osx', '350 req', 'linux', '150 req']));
  });

  it('draws the labels as glyph outlines when the canvas has a font', () => {
    const pie = (withFont: boolean) =>
      renderToSvg(
        <Partition
          id="requests"
          data={requests}
          layout={PartitionLayout.sunburst}
          valueAccessor={(d: Datum) => d.count}
          valueFormatter={(value: number) => `${value} req`}
          layers={[layer('os')]}
        />,
        withFont,
      );

    expect(textContents(pie(false))).toEqual(expect.arrayContaining(['win', '500 req']));
    expect(textContents(pie(true))).toEqual([]);
    // Each character is a 500 x 500 unit box, scaled to the label font size.
    expect(pie(true)).toMatch(/<path [^>]*d="M(?: [\d.-]+){2} H [\d.-]+ V [\d.-]+ H [\d.-]+ Z/);
  });

  it('draws a donut with an empty center', () => {
    const svg = partitionChart(PartitionLayout.sunburst, ['os'], { partition: { emptySizeRatio: 0.5 } });
    const pie = partitionChart(PartitionLayout.sunburst, ['os']);
    // A pie slice starts at the center, a donut sector at its inner radius.
    const [cx = NaN, cy = NaN] = firstPoint(pie);
    const [x = NaN, y = NaN] = firstPoint(svg);

    expect(arcPaths(svg)).toHaveLength(3);
    expect(Math.hypot(x - cx, y - cy)).toBeGreaterThan(20);
  });

  it('draws nested rings for two layers', () => {
    const svg = partitionChart(PartitionLayout.sunburst, ['os', 'response']);

    expect(arcPaths(svg)).toHaveLength(3 + 5);
  });

  it('draws treemap and mosaic rectangles with labels', () => {
    const treemap = partitionChart(PartitionLayout.treemap, ['os']);
    const mosaic = partitionChart(PartitionLayout.mosaic, ['os', 'response']);

    expect(arcPaths(treemap)).toHaveLength(0);
    expect(filledPaths(treemap, COLORS[0]!)).toHaveLength(1);
    expect(textContents(treemap)).toEqual(expect.arrayContaining(['win', 'osx', 'linux']));
    expect(textContents(mosaic)).toEqual(expect.arrayContaining(['win', 'osx', 'linux', '200', '404']));
  });

  it('draws waffle cells and a legend', () => {
    const svg = partitionChart(PartitionLayout.waffle, ['os'], {}, true);

    // 100 cells in all, at most one per percent.
    expect(svg.match(/<path [^>]*fill="#/g)?.length).toBeGreaterThanOrEqual(100);
    expect(filledPaths(svg, COLORS[0]!).length).toBeGreaterThan(40);
    expect(textContents(svg)).toEqual(expect.arrayContaining(['win', 'osx', 'linux']));
  });

  it('shows legend values after the labels', () => {
    const svg = partitionChart(PartitionLayout.waffle, ['os'], {}, true, { legendValues: [LegendValue.Value] });

    expect(textContents(svg)).toEqual(expect.arrayContaining(['win', '500 req', 'linux', '150 req']));
  });

  it('indents the nested items of a hierarchical legend', () => {
    const nested = partitionChart(PartitionLayout.sunburst, ['os', 'response'], {}, true, { flatLegend: false });
    const flat = partitionChart(PartitionLayout.sunburst, ['os', 'response'], {}, true, { flatLegend: true });

    expect(legendX(nested, '404') - legendX(nested, 'win')).toBe(10);
    expect(legendX(flat, '404') - legendX(flat, 'win')).toBe(0);
  });
});
