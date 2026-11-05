/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { collectSpecs, renderChart, SvgCanvas } from '.';
import { ChartType } from '../chart_types';
import { SeriesType } from '../chart_types/xy_chart/utils/specs';
import { Chart } from '../components/chart';
import { ScaleType } from '../scales/constants';
import { Axis, BarSeries, LineSeries, Settings } from '../specs';
import { SpecType } from '../specs/spec_type';
import { Position } from '../utils/common';

const WIDTH = 600;
const HEIGHT = 300;

const latency = ['checkout', 'cart'].flatMap((service, index) =>
  [0, 1, 2, 3].map((hour) => ({ hour, service, p95: 100 + index * 50 + hour * 10 })),
);

const latencyChart = (
  <>
    <Settings showLegend legendPosition={Position.Right} />
    <Axis id="hour" position={Position.Bottom} title="Hour" />
    <Axis id="p95" position={Position.Left} title="p95 (ms)" />
    <LineSeries
      id="latency"
      data={latency}
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="hour"
      yAccessors={['p95']}
      splitSeriesAccessors={['service']}
    />
  </>
);

const renderToSvg = (element: React.ReactElement) => {
  const svg = new SvgCanvas(WIDTH, HEIGHT);
  renderChart({ specs: collectSpecs(element), width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D });
  return svg.toSvg();
};

const textContents = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(([, text]) => text);

// The horizontal position of the bottom axis title, which is centered on the plot area.
const bottomTitleX = (svg: string) => {
  const [, offsetX = 'NaN', x = 'NaN'] = /matrix\(1 0 0 1 ([\d.]+) [\d.]+\)" x="(-?[\d.]+)"[^>]*>Hour</.exec(svg) ?? [];
  return Number(offsetX) + Number(x);
};

describe('Headless rendering', () => {
  // Tests run in jsdom; failing on any element creation shows the headless path needs no DOM.
  beforeEach(() => {
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      throw new Error(`Headless rendering created a <${tagName}> element`);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  describe('collectSpecs', () => {
    it('collects spec components with their defaults applied', () => {
      const specs = collectSpecs(latencyChart);

      expect(specs.map(({ id }) => id)).toEqual(expect.arrayContaining(['hour', 'p95', 'latency']));
      expect(specs.find(({ id }) => id === 'latency')).toMatchObject({
        chartType: ChartType.XYAxis,
        specType: SpecType.Series,
        seriesType: SeriesType.Line,
        groupId: '__global__',
      });
    });

    it('collects the specs inside a component that renders a Chart', () => {
      const MyChart = () => <Chart>{latencyChart}</Chart>;

      expect(collectSpecs(<MyChart />).map(({ id }) => id)).toEqual(expect.arrayContaining(['hour', 'p95', 'latency']));
    });
  });

  describe('renderChart', () => {
    it('draws series, axes and the legend as SVG', () => {
      const svg = renderToSvg(latencyChart);
      const texts = textContents(svg);

      expect(svg.startsWith('<svg')).toBe(true);
      expect(texts).toEqual(expect.arrayContaining(['Hour', 'p95 (ms)', 'checkout', 'cart']));
      expect(svg.match(/<path [^>]*stroke=/g)?.length).toBeGreaterThan(2);
    });

    it('measures text with the given context to lay out the axes', () => {
      const wideFont = new SvgCanvas(WIDTH, HEIGHT, { measureTextWidth: (text) => text.length * 40 });
      const narrowFont = new SvgCanvas(WIDTH, HEIGHT, { measureTextWidth: (text) => text.length * 2 });
      const specs = collectSpecs(latencyChart);
      [wideFont, narrowFont].forEach((svg) =>
        renderChart({ specs, width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D }),
      );

      // Wider labels resize the axes and the legend, so the plot area and its centered axis title move.
      expect(bottomTitleX(wideFont.toSvg())).toBeFinite();
      expect(bottomTitleX(wideFont.toSvg())).not.toBe(bottomTitleX(narrowFont.toSvg()));
    });

    it('draws textured bars with their plain fill', () => {
      const svg = renderToSvg(
        <>
          <BarSeries
            id="bars"
            data={[
              { x: 'a', y: 2 },
              { x: 'b', y: 3 },
            ]}
            xAccessor="x"
            yAccessors={['y']}
            xScaleType={ScaleType.Ordinal}
            barSeriesStyle={{ rect: { texture: { shape: 'circle' } } } as any}
          />
        </>,
      );

      expect(svg.match(/<path [^>]*fill="(?!none)/g)?.length).toBeGreaterThanOrEqual(2);
    });

    it('rejects chart types it cannot draw yet', () => {
      const specs = [{ id: 'timeslip', chartType: ChartType.Timeslip, specType: SpecType.Series }];
      const svg = new SvgCanvas(WIDTH, HEIGHT);

      expect(() =>
        renderChart({ specs, width: WIDTH, height: HEIGHT, context: svg.context, Path2D: svg.Path2D }),
      ).toThrow('Headless rendering does not support the "timeslip" chart type yet');
    });
  });
});
