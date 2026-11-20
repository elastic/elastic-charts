/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * The charts of the benchmarks, as elements made with a given build of the package: small and typical charts
 * of the main chart types, with made-up data that is the same on every run.
 *
 * Each is a function of a number. Without one it is the same chart every time. With one it is a chart like no
 * other: its id, the ids and colors of its series, its labels and its time range are of that number alone, as
 * the charts of a server differ from one another.
 */
module.exports = function charts(c, React) {
  const h = React.createElement;
  let seed = 42;
  const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const series = (n, groups) =>
    Array.from({ length: n * groups }, (_, i) => ({
      x: Math.floor(i / groups),
      y: 10 + random() * 20 + Math.sin(i / 30) * 5,
      g: `series ${i % groups}`,
    }));
  const HOUR = 3600e3;
  const start = Date.UTC(2026, 0, 1);
  const hourly = (n, groups) =>
    Array.from({ length: n * groups }, (_, i) => ({
      x: start + Math.floor(i / groups) * HOUR,
      y: 5 + random() * 10,
      g: `host-${i % groups}`,
    }));
  const lines = series(200, 4);
  const bars = series(40, 1);
  const grouped = series(40, 3);
  const stacked = hourly(500, 3);
  const dense = series(10000, 1);
  const names = Array.from({ length: 12 }, (_, i) => `category ${i}`);
  const slices = names.flatMap((a, i) =>
    ['north', 'south', 'east'].map((b, j) => ({ a, b, v: 5 + ((i * 7 + j * 13) % 23) })),
  );
  const cells = names.flatMap((y, i) =>
    Array.from({ length: 24 }, (_, x) => ({ x: `${x}h`, y, v: (i * 5 + x * 3) % 37 })),
  );
  // cells too small for a label, each with a value of its own
  const denseCells = Array.from({ length: 10000 }, (_, i) => ({
    x: i % 100,
    y: `y${Math.floor(i / 100)}`,
    v: random(),
  }));

  const size = { width: 800, height: 400 };
  const axes = () => [
    h(c.Axis, { id: 'bottom', position: 'bottom', key: 'bottom' }),
    h(c.Axis, { id: 'left', position: 'left', key: 'left' }),
  ];
  const legend = (legendPosition = 'right') => h(c.Settings, { showLegend: true, legendPosition });
  const xy = { xAccessor: 'x', yAccessors: ['y'] };
  // what a chart of a number has of its own
  const color = (i, k = 0) =>
    `#${(((i * 2654435761 + k * 40503 + 0x54b399) >>> 0) % 0x1000000).toString(16).padStart(6, '0')}`;
  const of = (i) => (i ? ` ${i}` : '');

  return {
    '5 bars': (i = 0) =>
      h(
        c.Chart,
        { size, id: `bars${of(i)}` },
        h(c.BarSeries, { id: `bars${of(i)}`, color: color(i), xScaleType: 'ordinal', ...xy, data: bars.slice(0, 5) }),
      ),
    '4 lines x 200, 40 bars, legend': (i = 0) =>
      h(
        c.Chart,
        { size, id: `lines${of(i)}` },
        legend(),
        ...axes(),
        h(c.LineSeries, { id: `lines${of(i)}`, xScaleType: 'linear', ...xy, splitSeriesAccessors: ['g'], data: lines }),
        h(c.BarSeries, { id: `bars${of(i)}`, color: color(i), xScaleType: 'linear', ...xy, data: bars }),
      ),
    '3 bar series x 40 categories': (i = 0) =>
      h(
        c.Chart,
        { size, id: `categories${of(i)}` },
        legend(),
        ...axes(),
        h(c.BarSeries, {
          id: `bars${of(i)}`,
          xScaleType: 'ordinal',
          xAccessor: (d) => `category ${d.x}${of(i)}`,
          yAccessors: ['y'],
          splitSeriesAccessors: ['g'],
          data: grouped,
        }),
      ),
    '3 stacked areas x 500, time axis': (i = 0) =>
      h(
        c.Chart,
        { size, id: `areas${of(i)}` },
        legend('bottom'),
        ...axes(),
        h(c.AreaSeries, {
          id: `areas${of(i)}`,
          xScaleType: 'time',
          ...xy,
          splitSeriesAccessors: ['g'],
          stackAccessors: ['x'],
          // a time range of its own: some days later, and not on the hour
          data: i ? stacked.map((d) => ({ ...d, x: d.x + i * 53 * HOUR + (i % 977) * 1000 })) : stacked,
        }),
      ),
    'line of 10,000 points': (i = 0) =>
      h(
        c.Chart,
        { size, id: `dense${of(i)}` },
        ...axes(),
        h(c.LineSeries, { id: `line${of(i)}`, color: color(i), xScaleType: 'linear', ...xy, data: dense }),
      ),
    'sunburst, 36 slices': (i = 0) =>
      h(
        c.Chart,
        { size, id: `sunburst${of(i)}` },
        legend(),
        h(c.Partition, {
          id: `sunburst${of(i)}`,
          data: slices,
          valueAccessor: (d) => d.v,
          layout: 'sunburst',
          layers: [
            {
              groupByRollup: (d) => `${d.a}${of(i)}`,
              nodeLabel: (d) => String(d),
              shape: { fillColor: (key, sortIndex) => color(i, sortIndex) },
            },
            { groupByRollup: (d) => d.b, nodeLabel: (d) => String(d) },
          ],
        }),
      ),
    'heatmap 24 x 12': (i = 0) =>
      h(
        c.Chart,
        { size, id: `heatmap${of(i)}` },
        legend(),
        h(c.Heatmap, {
          id: `heatmap${of(i)}`,
          data: cells,
          xAccessor: 'x',
          yAccessor: (d) => `${d.y}${of(i)}`,
          valueAccessor: 'v',
          xScale: { type: 'ordinal' },
          colorScale: {
            type: 'bands',
            bands: [
              { start: 0, end: 10, color: color(i, 1) },
              { start: 10, end: 25, color: color(i, 2) },
              { start: 25, end: 40, color: color(i, 3) },
            ],
          },
        }),
      ),
    'heatmap 100 x 100': (i = 0) =>
      h(
        c.Chart,
        { size, id: `dense heatmap${of(i)}` },
        h(c.Heatmap, {
          id: `heatmap${of(i)}`,
          data: denseCells,
          xAccessor: 'x',
          yAccessor: (d) => `${d.y}${of(i)}`,
          valueAccessor: 'v',
          xScale: { type: 'linear' },
          colorScale: {
            type: 'bands',
            bands: [
              { start: 0, end: 0.5, color: color(i, 1) },
              { start: 0.5, end: 1, color: color(i, 2) },
            ],
          },
        }),
      ),
  };
};
