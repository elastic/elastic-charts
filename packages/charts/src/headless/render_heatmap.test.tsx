/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import { Heatmap } from '../chart_types/heatmap/specs';
import { ScaleType } from '../scales/constants';
import { Settings } from '../specs';
import { Position } from '../utils/common';

const WIDTH = 600;
const HEIGHT = 300;

const RED = '#f6726a';
const BLUE = '#61a2ff';
// The cell renderer normalizes colors to rgb().
const RED_CELL = 'rgb(246,114,106)';
const BLUE_CELL = 'rgb(97,162,255)';

const data = ['checkout', 'cart'].flatMap((service, index) =>
  ['a', 'b', 'c'].map((host, hostIndex) => ({ host, service, count: index * 3 + hostIndex })),
);

const heatmap = (legendPosition: Position = Position.Right) => (
  <>
    <Settings showLegend legendPosition={legendPosition} theme={{ heatmap: { cell: { label: { visible: true } } } }} />
    <Heatmap
      id="heatmap"
      data={data}
      xAccessor="host"
      yAccessor="service"
      valueAccessor="count"
      xScale={{ type: ScaleType.Ordinal }}
      xAxisTitle="Host"
      yAxisTitle="Service"
      colorScale={{
        type: 'bands',
        bands: [
          { start: -Infinity, end: 3, color: BLUE },
          { start: 3, end: Infinity, color: RED },
        ],
      }}
    />
  </>
);

const renderToSvg = (element: React.ReactElement) => {
  const svg = new SvgCanvas(WIDTH, HEIGHT);
  renderChart({ specs: collectSpecs(element), width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D });
  return svg.toSvg();
};

const textContents = (svg: string) =>
  [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text = '']) =>
    text.replaceAll(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))),
  );

const countFills = (svg: string, color: string) => svg.split(`fill="${color}"`).length - 1;

// The horizontal offset of the first `<text>` whose content is `text`.
const textX = (svg: string, text: string) => {
  const [, offsetX = '0', x = 'NaN'] =
    new RegExp(`(?:matrix\\(1 0 0 1 ([\\d.-]+) [\\d.-]+\\)" )?x="(-?[\\d.]+)"[^>]*>${text}<`).exec(svg) ?? [];
  return Number(offsetX) + Number(x);
};

describe('Headless heatmap rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('draws cells colored by band, axis labels, titles and cell values', () => {
    const svg = renderToSvg(heatmap());
    const texts = textContents(svg);

    expect(countFills(svg, BLUE_CELL)).toBe(3);
    expect(countFills(svg, RED_CELL)).toBe(3);
    expect(texts).toEqual(expect.arrayContaining(['a', 'b', 'c', 'checkout', 'cart', 'Host', 'Service']));
    expect(texts).toEqual(expect.arrayContaining(['0', '1', '2', '3', '4', '5']));
  });

  it('draws the color bands as legend items', () => {
    const svg = renderToSvg(heatmap());

    expect(countFills(svg, BLUE)).toBe(1);
    expect(countFills(svg, RED)).toBe(1);
    expect(textContents(svg)).toEqual(expect.arrayContaining(['< 3', '≥ 3']));
  });

  it('moves the heatmap aside for a left legend', () => {
    const right = renderToSvg(heatmap(Position.Right));
    const left = renderToSvg(heatmap(Position.Left));

    expect(textX(left, '≥ 3')).toBeLessThan(textX(right, '≥ 3'));
    expect(textX(left, 'checkout')).toBeGreaterThan(textX(right, 'checkout'));
  });

  it('spreads a time x axis over the x domain in the given time zone', () => {
    const DAY = 24 * 60 * 60 * 1000;
    // Midnight in Amsterdam (UTC+1 in winter).
    const start = Date.UTC(2024, 0, 1) - 60 * 60 * 1000;
    const svg = renderToSvg(
      <>
        <Settings xDomain={{ min: start, max: start + 3 * DAY }} />
        <Heatmap
          id="heatmap"
          data={[0, 1].map((day) => ({ day: start + day * DAY, count: day }))}
          xAccessor="day"
          yAccessor={() => ''}
          valueAccessor="count"
          xScale={{ type: ScaleType.Time, interval: { type: 'fixed', unit: 'd', value: 1 } }}
          timeZone="Europe/Amsterdam"
          xAxisLabelFormatter={(value) => `day ${(Number(value) - start) / DAY}`}
          colorScale={{ type: 'bands', bands: [{ start: -Infinity, end: Infinity, color: RED }] }}
        />
      </>,
    );

    expect(countFills(svg, RED_CELL)).toBe(2);
    // The domain max is exclusive, so the grid ends with an empty day 2 column.
    expect(textContents(svg)).toEqual(expect.arrayContaining(['day 0', 'day 1', 'day 2']));
  });

  it('draws nothing when there is no data', () => {
    const svg = renderToSvg(
      <Heatmap
        id="heatmap"
        data={[]}
        xAccessor="host"
        yAccessor="service"
        valueAccessor="count"
        colorScale={{ type: 'bands', bands: [{ start: 0, end: 1, color: RED }] }}
      />,
    );

    expect(countFills(svg, RED_CELL)).toBe(0);
    expect(textContents(svg)).toEqual([]);
  });
});
