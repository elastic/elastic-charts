/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import type { MetricDatum } from '../chart_types/metric/specs';
import { Metric, Settings } from '../specs';
import { LayoutDirection } from '../utils/common';

const WIDTH = 600;
const HEIGHT = 200;

const formatter = (value: number) => `${value.toFixed(1)} KB`;

const renderToSvg = (data: Array<Array<MetricDatum | undefined>>, height = HEIGHT) => {
  const svg = new SvgCanvas(WIDTH, height);
  renderChart({
    specs: collectSpecs(
      <>
        <Settings theme={{ metric: { barBackground: '#ECF1F9' } }} />
        <Metric id="metric" data={data} />
      </>,
    ),
    width: WIDTH,
    height,
    context: svg.context,
    Path2D: svg.Path2D,
  });
  return svg.toSvg();
};

const tile = (title: string, value: number): MetricDatum => ({
  value,
  valueFormatter: String,
  title,
  color: '#FFFFFF',
});

const texts = (svg: string) =>
  [...svg.matchAll(/<text [^>]*x="([\d.]+)" y="([\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map(
    ([, x, y, size, text = '']) => ({ x: Number(x), y: Number(y), size: Number(size), text }),
  );
const textContents = (svg: string) => texts(svg).map(({ text }) => text);
// The value is drawn last, one text per part.
const valueParts = (svg: string, count: number) => texts(svg).slice(-count);
const fills = (svg: string) => [...svg.matchAll(/<path [^>]*fill="([^"]+)"/g)].map(([, fill]) => fill);

describe('Headless Metric rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('draws the title, subtitle and the value with a smaller unit', () => {
    const svg = renderToSvg([
      [{ value: 5432.1, valueFormatter: formatter, title: 'Bytes', subtitle: 'Average', color: '#FFFFFF' }],
    ]);
    const texts = textContents(svg);

    expect(texts).toEqual(expect.arrayContaining(['Bytes', 'Average']));
    const [value, unit] = valueParts(svg, 2);
    expect(value?.text).toBe('5432.1');
    expect(unit?.text).toBe(' KB');
    expect(unit?.size).toBeLessThan(value?.size ?? 0);
  });

  it('fills the tile with its color and picks a contrasting text color', () => {
    const svg = renderToSvg([[{ value: 12, valueFormatter: String, title: 'Errors', color: '#000000' }]]);

    expect(fills(svg)).toContain('rgb(0,0,0)');
    // The theme's light text color.
    expect(svg).toMatch(/fill="rgb\(227,232,242\)"[^>]*>12</);
  });

  it('draws the secondary metric as a badge with its label', () => {
    const svg = renderToSvg([
      [
        {
          value: 10,
          valueFormatter: String,
          title: 'Requests',
          color: '#FFFFFF',
          extra: { value: '+5', label: 'vs last week', badgeColor: '#C9F3E3', icon: '↑' },
        },
      ],
    ]);

    expect(textContents(svg)).toEqual(expect.arrayContaining(['vs last week', '+5', '↑']));
    expect(fills(svg)).toContain('#C9F3E3');
    // The badge comes after the label.
    const label = texts(svg).find(({ text }) => text === 'vs last week');
    const value = texts(svg).find(({ text }) => text === '+5');
    expect(value?.x).toBeGreaterThan(label?.x ?? Infinity);
  });

  it('cuts a secondary metric that is wider than the tile with an ellipsis, label first', () => {
    const svg = renderToSvg([
      [
        {
          value: 10,
          valueFormatter: String,
          title: 'Requests',
          color: '#FFFFFF',
          extra: { value: '1234 requests', label: 'A very long secondary metric label '.repeat(4) },
        },
      ],
    ]);
    const all = textContents(svg);

    expect(all).toContain('1234 requests');
    const label = all.find((text) => text.startsWith('A very long'));
    expect(label).toMatch(/…$/);
    expect(label?.length).toBeLessThan('A very long secondary metric label '.repeat(4).length);
  });

  it('draws a progress bar with its track and fill', () => {
    const svg = renderToSvg([
      [
        {
          value: 30,
          valueFormatter: String,
          title: 'Disk',
          color: '#61A2FF',
          domainMax: 100,
          progressBarDirection: LayoutDirection.Horizontal,
        },
      ],
    ]);
    const paths = fills(svg);

    expect(paths).toContain('#ECF1F9');
    expect(paths).toContain('rgb(97,162,255)');
    // The fill covers 30% of the 584px track inside the 8px padding: its right edge is at 183.2.
    expect(svg).toMatch(/<path d="M[^"]*183\.2[^"]*" fill="rgb\(97,162,255\)"/);
  });

  it('draws a gradient progress fill across the whole track', () => {
    const svg = renderToSvg([
      [
        {
          value: 50,
          valueFormatter: String,
          title: 'Disk',
          color: '#61A2FF',
          domainMax: 100,
          progressBarDirection: LayoutDirection.Horizontal,
          progressBarFill: {
            type: 'palette',
            style: 'gradient',
            colorStops: [
              { stop: 0, color: '#FF0000' },
              { stop: 100, color: '#0000FF' },
            ],
          },
        },
      ],
    ]);

    // The gradient runs from the start of the 584px track to its end, and the fill reveals half of it.
    expect(svg).toMatch(/<linearGradient id="(\w+)" gradientUnits="userSpaceOnUse" x1="8" y1="[\d.]+" x2="592"/);
    expect(svg).toMatch(/<stop offset="0" stop-color="rgb\(255,0,0\)"/);
    expect(svg).toMatch(/<path d="M[^"]*300[^"]*" fill="url\(#gradient\d+\)"/);
  });

  it('draws the trend as an area over the tile color', () => {
    const svg = renderToSvg([
      [
        {
          value: 4,
          valueFormatter: String,
          title: 'Trend',
          color: '#D9E8FF',
          trend: [0, 1, 2, 3].map((x) => ({ x, y: [2, 5, 3, 4][x] ?? 0 })),
          trendShape: 'area',
        },
      ],
    ]);

    expect(fills(svg)).toEqual(expect.arrayContaining(['rgb(217,232,255)']));
    // The area spans the tile width, from the left edge to the right one.
    expect(svg).toMatch(/<path d="M0 [\d.]+L[^"]*L600 /);
  });

  it('lays out a breakdown as a grid with one tile per datum and borders between tiles', () => {
    const svg = renderToSvg(
      [
        [tile('a', 1), tile('b', 2), tile('c', 3)],
        [tile('d', 4), tile('e', 5)],
      ],
      240,
    );

    expect(textContents(svg)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e']));
    expect(textContents(svg).filter((text) => /^\d$/.test(text))).toEqual(['1', '2', '3', '4', '5']);
    const titleX = (title: string) => Number(new RegExp(`x="([\\d.]+)"[^>]*>${title}<`).exec(svg)?.[1]);
    const titleY = (title: string) => Number(new RegExp(`y="([\\d.]+)"[^>]*>${title}<`).exec(svg)?.[1]);
    expect(titleX('b') - titleX('a')).toBeCloseTo(WIDTH / 3);
    expect(titleY('d') - titleY('a')).toBeCloseTo(120);
  });

  it('draws icons that render as SVG paths', () => {
    const Icon = ({ width, height }: { width: number; height: number }) => (
      <svg width={width} height={height} viewBox="0 0 16 16">
        <path d="M0 0h16v16H0z" />
      </svg>
    );
    const svg = renderToSvg([[{ value: 1, valueFormatter: String, title: 'With icon', color: '#FFFFFF', icon: Icon }]]);

    // A 16px icon in the top right corner, inside the 8px panel padding.
    expect(svg).toMatch(/<path transform="matrix\(1 0 0 1 576 8\)" d="M0 0h16v16H0z"/);
  });
});
