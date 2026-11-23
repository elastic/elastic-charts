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

import React from 'react';

import { renderChart } from './render_chart';
import { Metric } from '../chart_types/metric/specs';
import {
  Axis,
  BarSeries,
  Bullet,
  BulletSubtype,
  Goal,
  Heatmap,
  LineAnnotation,
  LineSeries,
  Partition,
  RectAnnotation,
  Wordcloud,
} from '../chart_types/specs';
import { Chart } from '../components/chart';
import { ScaleType } from '../scales/constants';
import { Settings } from '../specs/settings';
import * as chartState from '../state/chart_state';
import { createChartStore } from '../state/chart_state';
import { globalSelectorCache } from '../state/create_selector';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { Position } from '../utils/common';

const data = [
  { x: 'alpha', y: 2_000_000, g: 'first' },
  { x: 'beta', y: 7_000_000, g: 'first' },
  { x: 'gamma', y: 3_000_000, g: 'first' },
  { x: 'alpha', y: 4_000_000, g: 'second' },
  { x: 'beta', y: 1_000_000, g: 'second' },
  { x: 'gamma', y: 6_000_000, g: 'second' },
];

const xyChart = (id: string, showLegend = false) => (
  <Chart id={id} size={{ width: 600, height: 300 }}>
    <Settings showLegend={showLegend} legendPosition={Position.Right} />
    <Axis id="bottom" position={Position.Bottom} title="category" />
    <Axis id="left" position={Position.Left} title="amount" />
    <BarSeries
      id="bars"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      data={data}
    />
  </Chart>
);

const bars = (
  <BarSeries
    id="bars"
    xScaleType={ScaleType.Ordinal}
    xAccessor="x"
    yAccessors={['y']}
    splitSeriesAccessors={['g']}
    data={data}
  />
);

/**
 * Every key in the registry of memoized selectors, per selector: chart ids of mounted charts, and for
 * the duration of a headless render, the key of that render.
 */
const selectorRegistry = () =>
  (globalSelectorCache as unknown as { selectorCaches: Array<{ cache: Map<string, unknown> }> }).selectorCaches.map(
    ({ cache }) => [...cache.keys()].sort(),
  );

const count = (markup: string, pattern: RegExp) => (markup.match(pattern) ?? []).length;
/** the svg the chart is drawn in; legend icons are small svgs of their own */
const STAGE = /<svg class="[^"]*echSvgRenderer[^"]*"[^>]*>/g;
const stageWidth = (markup: string) => Number(/\swidth="([\d.]+)"/.exec(markup.match(STAGE)?.[0] ?? '')?.[1]);
const ids = (markup: string) => [...markup.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id);

describe('renderChart without a DOM', () => {
  // Whatever a test renders, and however that ends, the registry is as it was: no key added under any
  // name, none removed, no selector registered.
  let registryBefore: string[][];
  beforeEach(() => {
    registryBefore = selectorRegistry();
  });
  afterEach(() => {
    expect(selectorRegistry()).toEqual(registryBefore);
  });

  it('runs where no document or window exists', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
  });

  it('requires a direct Chart element', () => {
    const Wrapper = () => xyChart('wrapped');
    expect(() => renderChart(<Wrapper />)).toThrow('renderChart expects a <Chart> element');
    expect(() => renderChart(<div>{xyChart('wrapped')}</div>)).toThrow('renderChart expects a <Chart> element');
    expect(() => renderChart(<>{xyChart('wrapped')}</>)).toThrow('renderChart expects a <Chart> element');
  });

  describe('xy', () => {
    it('draws the chart as one inline svg under a single root', () => {
      const markup = renderChart(xyChart('xy'));
      expect(markup.startsWith('<div')).toBe(true);
      expect(markup.endsWith('</div>')).toBe(true);
      expect(count(markup, STAGE)).toBe(1);
      expect(markup).not.toContain('<canvas');
    });

    it('draws the six bars and the axis text', () => {
      const markup = renderChart(xyChart('xy'));
      const start = markup.search(STAGE);
      const svg = markup.slice(start, markup.indexOf('</svg>', start));
      // the bars are filled paths; grid lines and axis lines have no fill
      expect(count(svg, /<path[^>]*fill="rgb\([^"]+"/g)).toBe(6);
      for (const label of ['alpha', 'beta', 'gamma', 'category', 'amount']) {
        expect(svg).toMatch(new RegExp(`<text[^>]*>${label}</text>`));
      }
    });

    it('renders a series whose ID is __proto__', () => {
      const markup = renderChart(
        <Chart id="prototype-id" size={{ width: 400, height: 200 }}>
          <BarSeries id="__proto__" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
        </Chart>,
      );
      expect(count(markup, STAGE)).toBe(1);
      expect(count(markup, /<path[^>]*fill="rgb\([^"]+"/g)).toBe(6);
    });

    it('lays out with measured text, so the left axis has room for its labels', () => {
      const markup = renderChart(xyChart('xy'));
      expect(markup).toMatch(/<text[^>]*>70{6}<\/text>/);
      // the plot starts right of the axis title, the widest tick label and the paddings;
      // with labels measured as zero wide it would start at 40
      const [, plotLeft] = /<g transform="translate\(([\d.]+) [\d.]+\)"><g><g><path[^>]*stroke=/.exec(markup) ?? [];
      expect(Number(plotLeft)).toBeGreaterThan(70);
    });

    it('keeps ids of two charts in one page apart', () => {
      const first = ids(renderChart(xyChart('first')));
      const second = ids(renderChart(xyChart('second')));
      expect(first.length).toBeGreaterThan(0);
      expect(first.filter((id) => second.includes(id))).toEqual([]);
    });

    it('renders the same markup for the same chart', () => {
      expect(renderChart(xyChart('same'))).toBe(renderChart(xyChart('same')));
    });

    it('omits the chart title and description without affecting the plot', () => {
      const chart = xyChart('titled');
      const titled = React.cloneElement(chart, { title: 'Chart title', description: 'Chart description' });
      const markup = renderChart(titled);
      expect(markup).toBe(renderChart(chart));
      expect(markup).not.toContain('echChart__titles');
      expect(markup).toMatch(/<text[^>]*>category<\/text>/);
    });

    it('needs numeric width and height in pixels', () => {
      expect(() =>
        renderChart(
          <Chart>
            <LineSeries id="line" xAccessor="x" yAccessors={['y']} data={data} />
          </Chart>,
        ),
      ).toThrow(/numeric width and height in pixels/);
      expect(() => renderChart(React.cloneElement(xyChart('string-size'), { size: '400px' }))).toThrow(
        /numeric width and height in pixels/,
      );
      expect(() => renderChart(React.cloneElement(xyChart('mixed-size'), { size: [400, '300px'] }))).toThrow(
        /numeric width and height in pixels/,
      );
      // numbers that are not a size: they would end up as `NaN` in the markup, or as a chart with nothing in it
      for (const width of [0, -100, NaN, Infinity]) {
        expect(() =>
          renderChart(React.cloneElement(xyChart('no-such-size'), { size: { width, height: 300 } })),
        ).toThrow(/positive numeric width and height in pixels/);
      }
    });
  });

  describe('legend', () => {
    it('renders the legend items as HTML beside the svg', () => {
      const markup = renderChart(xyChart('legend', true));
      expect(markup).toContain('echLegend');
      const beforeStage = markup.slice(0, markup.search(STAGE));
      expect(beforeStage).toMatch(/echLegendItem__label[^>]*>first</);
      expect(beforeStage).toMatch(/echLegendItem__label[^>]*>second</);
    });

    it('gives the legend room: the plot is narrower than without it', () => {
      const withLegend = stageWidth(renderChart(xyChart('legend', true)));
      const without = stageWidth(renderChart(xyChart('legend', false)));
      expect(withLegend).toBeLessThan(without);
      expect(withLegend).toBeGreaterThan(300);
      // the legend is as wide as its longest label and the marker need
      expect(without - withLegend).toBeGreaterThan(40);
    });
  });

  describe('metric', () => {
    const metric = (
      <Chart id="metric" size={{ width: 400, height: 200 }}>
        <Metric
          id="metric"
          data={[
            [
              {
                color: '#3c3c3c',
                title: 'Requests',
                subtitle: 'per second',
                value: 1234,
                valueFormatter: (d) => `${d} rps`,
              },
              { color: '#5e5e5e', title: 'Errors', value: 'none' },
            ],
          ]}
        />
      </Chart>
    );

    it('renders the panels as HTML with their titles and values', () => {
      const markup = renderChart(metric);
      expect(markup).toContain('echMetric');
      for (const text of ['Requests', 'per second', '1234 rps', 'Errors', 'none']) {
        expect(markup).toContain(text);
      }
    });

    it('fits the value text with measured widths', () => {
      const markup = renderChart(metric);
      const [, fontSize] = /echMetricText__value[^>]*font-size:\s*([\d.]+)px/.exec(markup) ?? [];
      expect(Number(fontSize)).toBeGreaterThan(10);
    });

    it('does not reserve space for an omitted chart title or description', () => {
      const titled = React.cloneElement(metric, { title: 'Chart title', description: 'Chart description' });
      expect(renderChart(titled)).toBe(renderChart(metric));
    });
  });

  describe('legend positions', () => {
    const size = { width: 600, height: 300 };
    const stageHeight = (markup: string) => Number(/\sheight="([\d.]+)"/.exec(markup.match(STAGE)?.[0] ?? '')?.[1]);

    it('takes height, not width, from the plot when the legend is at the bottom', () => {
      const markup = renderChart(
        <Chart id="bottom" size={size}>
          <Settings showLegend legendPosition={Position.Bottom} />
          {bars}
        </Chart>,
      );
      expect(markup).toContain('echLegend--bottom');
      expect(stageWidth(markup)).toBe(600);
      expect(stageHeight(markup)).toBeLessThan(300);
    });

    it('floats an inside legend over a plot of full size', () => {
      const markup = renderChart(
        <Chart id="inside" size={size}>
          <Settings
            showLegend
            legendPosition={{ vAlign: 'top', hAlign: 'right', direction: 'vertical', floating: true }}
          />
          {bars}
        </Chart>,
      );
      expect(markup).toMatch(/class="echLegend [^"]*" style="position:absolute/);
      expect(stageWidth(markup)).toBe(600);
      expect(stageHeight(markup)).toBe(300);
    });
  });

  describe('annotations', () => {
    it('draws the annotations in the svg and line markers as positioned HTML', () => {
      const markup = renderChart(
        <Chart id="annotations" size={{ width: 600, height: 300 }}>
          <LineAnnotation
            id="limit"
            domainType="yDomain"
            dataValues={[{ dataValue: 3_000_000, details: 'limit' }]}
            marker={<span>!</span>}
            markerBody="limit"
          />
          <RectAnnotation id="band" dataValues={[{ coordinates: { y0: 1_000_000, y1: 2_000_000 } }]} />
          <BarSeries id="bars" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
        </Chart>,
      );
      expect(markup).toMatch(/<path[^>]*fill-opacity="0.25"/);
      expect(markup).toMatch(/class="echAnnotation__marker"[^>]*style="[^"]*top:[\d.]+px/);
      expect(markup).toContain('<div class="echAnnotation__body">limit</div>');
    });
  });

  describe('other chart types that draw through the painter', () => {
    const size = { width: 400, height: 300 };
    const stage = (markup: string) => {
      const start = markup.search(STAGE);
      return markup.slice(start, markup.indexOf('</svg>', start));
    };

    it('partition', () => {
      const markup = renderChart(
        <Chart id="partition" size={size}>
          <Settings showLegend />
          <Partition
            id="partition"
            data={[
              { key: 'north', value: 3 },
              { key: 'south', value: 5 },
            ]}
            valueAccessor={(d) => d.value}
            layers={[{ groupByRollup: (d: { key: string }) => d.key }]}
          />
        </Chart>,
      );
      expect(count(stage(markup), /<path[\s>]/g)).toBeGreaterThanOrEqual(2);
      expect(markup).toMatch(/echLegendItem__label[^>]*>north</);
      expect(markup).toMatch(/echLegendItem__label[^>]*>south</);
    });

    it('heatmap', () => {
      const markup = renderChart(
        <Chart id="heatmap" size={size}>
          <Heatmap
            id="heatmap"
            colorScale={{
              type: 'bands',
              bands: [
                { start: 0, end: 5, color: '#aaaaaa' },
                { start: 5, end: 10, color: '#333333' },
              ],
            }}
            data={[
              { x: 'east', y: 'row', value: 2 },
              { x: 'west', y: 'row', value: 7 },
            ]}
            xAccessor="x"
            yAccessor="y"
            valueAccessor="value"
          />
        </Chart>,
      );
      for (const label of ['east', 'west', 'row'])
        expect(stage(markup)).toMatch(new RegExp(`<text[^>]*>${label}</text>`));
    });

    it('goal', () => {
      const markup = renderChart(
        <Chart id="goal" size={size}>
          <Goal
            id="goal"
            subtype="goal"
            base={0}
            target={260}
            actual={170}
            domain={{ min: 0, max: 300 }}
            bands={[200, 250, 300]}
            ticks={[0, 100, 200, 300]}
            labelMajor="Revenue"
            labelMinor="thousand USD"
            centralMajor="170"
            centralMinor=""
          />
        </Chart>,
      );
      for (const label of ['Revenue', 'thousand USD', '170']) {
        expect(stage(markup)).toMatch(new RegExp(`<text[^>]*>${label}</text>`));
      }
    });

    it('bullet', () => {
      const markup = renderChart(
        <Chart id="bullet" size={size}>
          <Bullet
            id="bullet"
            subtype={BulletSubtype.horizontal}
            data={[
              [
                {
                  title: 'Throughput',
                  value: 23,
                  target: 30,
                  domain: [0, 100],
                  valueFormatter: String,
                  tickFormatter: String,
                },
              ],
            ]}
          />
        </Chart>,
      );
      expect(stage(markup)).toMatch(/<text[^>]*>Throughput<\/text>/);
      expect(stage(markup)).toMatch(/<text[^>]*>100<\/text>/);
    });
  });

  describe('metric variants', () => {
    it('renders a trend as an svg sparkline and a progress bar as HTML', () => {
      const markup = renderChart(
        <Chart id="variants" size={{ width: 400, height: 200 }}>
          <Metric
            id="metric"
            data={[
              [
                {
                  color: '#3c3c3c',
                  title: 'CPU',
                  value: 55,
                  valueFormatter: (d) => `${d}%`,
                  trend: [
                    { x: 1, y: 2 },
                    { x: 2, y: 5 },
                    { x: 3, y: 3 },
                  ],
                  trendShape: 'area',
                },
                {
                  color: '#3c3c3c',
                  title: 'Memory',
                  value: 30,
                  domainMax: 100,
                  progressBarDirection: 'vertical',
                  valueFormatter: (d) => `${d}%`,
                },
              ],
            ]}
          />
        </Chart>,
      );
      expect(markup).toMatch(/<svg class="echSingleMetricSparkline__svg"[^>]*>.*?<path d="M0,0.6L0.5,0L1,0.4/);
      expect(markup).toContain('echSingleMetricProgress--vertical');
    });
  });

  describe('debug state', () => {
    it('is in the markup when the chart asks for it, as in a browser', () => {
      const markup = renderChart(
        <Chart id="debug" size={{ width: 600, height: 300 }}>
          <Settings debugState />
          <Axis id="left" position={Position.Left} />
          <BarSeries id="bars" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
        </Chart>,
      );
      const [, attribute] = /data-ech-debug-state="([^"]*)"/.exec(markup) ?? [];
      const debugState = JSON.parse((attribute ?? '').replaceAll('&quot;', '"'));
      expect(debugState.bars).toHaveLength(1);
      expect(debugState.bars[0].bars).toHaveLength(6);
      expect(debugState.axes.y[0].labels).toContain('7000000');
    });
  });

  describe('a chart with nothing to draw', () => {
    it('renders the no results message', () => {
      const markup = renderChart(
        <Chart id="empty" size={{ width: 400, height: 200 }}>
          <Settings showLegend />
        </Chart>,
      );
      expect(markup).toContain('<div class="echReactiveChart_noResults"><p>No data to display</p></div>');
    });
  });

  describe('chart types that need a canvas of their own', () => {
    it('are refused by name', () => {
      expect(() =>
        renderChart(
          <Chart id="words" size={{ width: 400, height: 200 }}>
            <Wordcloud id="words" data={[{ text: 'hello', weight: 1, color: '#000000' }]} />
          </Chart>,
        ),
      ).toThrow('renderChart does not support wordcloud charts');
    });
  });

  describe('functions given to Settings', () => {
    it('listeners are not called, so one written for a browser does no harm', () => {
      const listeners = Object.fromEntries(
        [
          ...['onProjectionAreaChange', 'onRenderChange', 'onWillRender', 'onResize', 'onPointerUpdate', 'onBrushEnd'],
          ...['onElementClick', 'onElementOver', 'onElementOut', 'onProjectionClick', 'onAnnotationClick'],
          ...['onLegendItemOver', 'onLegendItemOut', 'onLegendItemClick', 'onLegendItemPlusClick'],
          'onLegendItemMinusClick',
        ].map((name) => [name, jest.fn(() => window.devicePixelRatio)]),
      );
      const markup = renderChart(
        React.cloneElement(xyChart('listeners', true), {}, <Settings showLegend {...listeners} />, bars),
      );
      expect(count(markup, STAGE)).toBe(1);
      for (const listener of Object.values(listeners)) expect(listener).not.toHaveBeenCalled();
    });

    it('functions that shape what is drawn are called', () => {
      const legendSort = jest.fn(() => 0);
      const renderingSort = jest.fn(() => 0);
      renderChart(
        React.cloneElement(
          xyChart('sorts'),
          {},
          <Settings showLegend legendSort={legendSort} renderingSort={renderingSort} />,
          bars,
        ),
      );
      expect(legendSort).toHaveBeenCalled();
      expect(renderingSort).toHaveBeenCalled();
    });
  });

  describe('memoized selectors of the chart', () => {
    it('leave the registry as it was, however many charts are rendered', () => {
      for (let i = 0; i < 20; i++) renderChart(xyChart(`one-of-many-${i}`, true));
      expect(selectorRegistry()).toEqual(registryBefore);
    });

    it('are kept apart from those of another chart with the same id', () => {
      // what a chart with this id, mounted or rendered by React on a server, leaves in the registry
      const mounted = createChartStore('shared').getState();
      const settings = getSettingsSpecSelector(mounted);
      const withMounted = selectorRegistry();
      expect(withMounted).not.toEqual(registryBefore);

      renderChart(xyChart('shared', true));

      expect(selectorRegistry()).toEqual(withMounted);
      expect(getSettingsSpecSelector(mounted)).toBe(settings);
      globalSelectorCache.removeKeyFromAll('shared');
    });

    // the registry check after each test is what these four are about: one per way out of `renderChart`
    it('are released when the chart type is refused', () => {
      expect(() =>
        renderChart(
          <Chart id="refused" size={{ width: 400, height: 200 }}>
            <Wordcloud id="words" data={[{ text: 'hello', weight: 1, color: '#000000' }]} />
          </Chart>,
        ),
      ).toThrow('does not support');
    });

    it('are released when drawing throws', () => {
      expect(() =>
        renderChart(
          <Chart id="throws" size={{ width: 400, height: 200 }}>
            <Axis
              id="left"
              position={Position.Left}
              tickFormat={() => {
                throw new Error('a formatter that fails');
              }}
            />
            <BarSeries id="bars" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
          </Chart>,
        ),
      ).toThrow('a formatter that fails');
    });

    it('are released when a child of the chart throws while the specs are gathered', () => {
      const Failing = () => {
        throw new Error('a child that fails');
      };
      expect(() =>
        renderChart(
          <Chart id="child-throws" size={{ width: 400, height: 200 }}>
            <BarSeries id="bars" xScaleType={ScaleType.Ordinal} xAccessor="x" yAccessors={['y']} data={data} />
            <Failing />
          </Chart>,
        ),
      ).toThrow('a child that fails');
    });

    it('are released when a chart is nested in the chart', () => {
      expect(() =>
        renderChart(
          <Chart id="outer" size={{ width: 400, height: 200 }}>
            {xyChart('inner')}
          </Chart>,
        ),
      ).toThrow('expects one Chart, the element rendered 2');
    });
  });

  describe('many series', () => {
    it('keeps store dispatches constant as the number of series grows', () => {
      const series = Array.from({ length: 2000 }, (_, i) => (
        <LineSeries
          key={i}
          id={`line-${i}`}
          xAccessor={0}
          yAccessors={[1]}
          data={[
            [0, i],
            [1, i + 1],
          ]}
        />
      ));
      const dispatchCounts: Array<() => number> = [];
      const { createChartStore } = chartState;
      const spy = jest.spyOn(chartState, 'createChartStore').mockImplementation((...args) => {
        const store = createChartStore(...args);
        const dispatch = jest.spyOn(store, 'dispatch');
        dispatchCounts.push(() => dispatch.mock.calls.length);
        return store;
      });

      try {
        renderChart(
          <Chart id="few" size={{ width: 800, height: 400 }}>
            {series.slice(0, 1)}
          </Chart>,
        );
        const markup = renderChart(
          <Chart id="many" size={{ width: 800, height: 400 }}>
            {series}
          </Chart>,
        );
        expect(count(markup, /<path[\s>]/g)).toBeGreaterThanOrEqual(2000);
        expect(dispatchCounts).toHaveLength(2);
        const [fewDispatches, manyDispatches] = dispatchCounts.map((countDispatches) => countDispatches());
        expect(fewDispatches).toBeGreaterThan(0);
        expect(manyDispatches).toBe(fewDispatches);
      } finally {
        spy.mockRestore();
      }
    });
  });
});
