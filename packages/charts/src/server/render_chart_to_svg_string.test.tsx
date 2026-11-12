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

// eslint-disable-next-line header/header -- jest reads the environment pragma only from the first comment
import React from 'react';

import { renderChartToSVGString } from './render_chart_to_svg_string';
import { Metric } from '../chart_types/metric/specs';
import { Chart } from '../components/chart';
import { ScaleType } from '../scales/constants';
import type { SettingsProps } from '../specs';
import { BarSeries, LineAnnotation, Settings } from '../specs';
import { Position } from '../utils/common';

const data = [
  { x: 'a', y: 2, g: 'first' },
  { x: 'b', y: 5, g: 'first' },
  { x: 'a', y: 3, g: 'second' },
  { x: 'b', y: 1, g: 'second' },
];

const renderChart = (settings: Partial<SettingsProps>, extra?: React.ReactNode) =>
  renderChartToSVGString(
    <Chart id="chart" size={{ width: 400, height: 200 }}>
      <Settings {...settings} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data}
      />
      {extra}
    </Chart>,
  );

const textX = (svg: string, text: string) =>
  Number(new RegExp(`<text x="([\\d.]+)"[^>]*>${text}</text>`).exec(svg)?.[1]);
const stageTransform = (svg: string) =>
  /^<svg[^>]*>(?:<rect[^>]*><\/rect>)?<g(?: transform="([^"]*)")?>/.exec(svg)?.[1];

describe('renderChartToSVGString', () => {
  it('returns a standalone svg document of the chart size', () => {
    const svg = renderChart({});
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="400" height="200" viewBox="0 0 400 200"/);
    expect(svg).toContain('<path');
  });

  it('draws the legend right of the chart by default', () => {
    const svg = renderChart({ showLegend: true });
    expect(textX(svg, 'first')).toBeGreaterThan(300);
    expect(textX(svg, 'second')).toBe(textX(svg, 'first'));
    expect(stageTransform(svg)).toBeUndefined();
  });

  it('shifts the chart right of a left legend', () => {
    const svg = renderChart({ showLegend: true, legendPosition: Position.Left });
    expect(textX(svg, 'first')).toBeLessThan(100);
    expect(stageTransform(svg)).toMatch(/translate\([1-9][\d.]* 0\)/);
  });

  it('lays a top legend out in columns and shifts the chart below it', () => {
    const svg = renderChart({ showLegend: true, legendPosition: Position.Top });
    expect(textX(svg, 'second')).toBeGreaterThan(textX(svg, 'first'));
    expect(stageTransform(svg)).toMatch(/translate\(0 [1-9][\d.]*\)/);
  });

  it('draws text and svg annotation markers', () => {
    const svg = renderChart(
      {},
      <>
        <LineAnnotation id="text" domainType="yDomain" dataValues={[{ dataValue: 3 }]} marker="limit" />
        <LineAnnotation
          id="icon"
          domainType="yDomain"
          dataValues={[{ dataValue: 4 }]}
          marker={
            <svg width={12} height={12}>
              <circle r={6} cx={6} cy={6} data-testid="icon" />
            </svg>
          }
        />
      </>,
    );
    expect(svg).toMatch(/<text [^>]*>limit<\/text>/);
    expect(svg).toMatch(/<g transform="translate\([^)]*\)"[^>]*><svg width="12" height="12"><circle/);
  });

  it('draws metric panels: background, sparkline, title and value parts', () => {
    const svg = renderChartToSVGString(
      <Chart id="metric" size={{ width: 400, height: 200 }}>
        <Metric
          id="metric"
          data={[
            [
              {
                color: '#6DCCB1',
                title: 'CPU usage',
                value: 55.23,
                valueFormatter: (v: number) => `${v} %`,
                trend: [
                  { x: 0, y: 1 },
                  { x: 1, y: 3 },
                ],
                trendShape: 'area',
              },
              {
                color: '#F1D86F',
                title: 'Memory',
                value: 12,
                valueFormatter: (v: number) => `${v}`,
                extra: (
                  <span>
                    last <b>5m</b>
                  </span>
                ),
              },
            ],
          ]}
        />
      </Chart>,
    );
    expect(svg).toMatch(/<svg x="0" y="0" width="200" height="200" viewBox="0 0 1 1"/);
    expect(svg).toMatch(/<text [^>]*font-weight="500"[^>]*>CPU usage<\/text>/);
    expect(svg).toMatch(/<text [^>]*>55.23<\/text>/);
    expect(svg).toMatch(/<text [^>]*>last <\/text>.*<text [^>]*font-weight="bold"[^>]*>5m<\/text>/);
  });

  it('requires a chart with a size in pixels', () => {
    expect(() => renderChartToSVGString(<div />)).toThrow('expects a <Chart> element');
    expect(() =>
      renderChartToSVGString(
        <Chart size={['100%', 200]}>
          <BarSeries id="bars" xAccessor="x" yAccessors={['y']} data={data} />
        </Chart>,
      ),
    ).toThrow('size in pixels');
  });
});
