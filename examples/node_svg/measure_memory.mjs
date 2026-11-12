/*
 * Measures the memory needed to render one SVG chart, with a legend and annotations, in Node.
 *
 *   node --expose-gc --max-semi-space-size=256 examples/node_svg/measure_memory.mjs [points=5] [series=bar|line]
 *
 * The large semi-space keeps the young generation from being collected mid-render, so the heap
 * growth across one render approximates what that render allocates.
 * Reports the cost of a one-shot process (load + first render) and the steady-state cost
 * of each further render in a long-lived process.
 */
if (typeof globalThis.gc !== 'function') throw new Error('run with --expose-gc');

const points = Number(process.argv[2] ?? 5);
const seriesType = process.argv[3] ?? 'bar';
const RUNS = Number(process.env.RUNS ?? 50);

const MB = 1024 * 1024;
const fmt = (bytes) => `${(bytes / MB).toFixed(1)} MB`;
const snapshot = () => {
  globalThis.gc();
  const { rss, heapUsed, external, arrayBuffers } = process.memoryUsage();
  return { rss, heapUsed, external: external + arrayBuffers };
};

const start = snapshot();

const { Axis, BarSeries, Chart, LineAnnotation, LineSeries, Position, RectAnnotation, ScaleType, Settings } =
  await import('@elastic/charts');
const { renderChartToSVGString, registerFont } = await import('@elastic/charts/server');
const React = (await import('react')).default;
const loaded = snapshot();

// FONT_DIR: measure text with these .ttf/.otf files instead of the built-in estimate
if (process.env.FONT_DIR) {
  const { readdirSync, readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  for (const file of readdirSync(process.env.FONT_DIR).filter((f) => /\.(ttf|otf)$/i.test(f))) {
    registerFont(readFileSync(join(process.env.FONT_DIR, file)), { aliases: ['Helvetica', 'Arial'], generic: 'sans-serif' });
  }
}
const fontsLoaded = snapshot();

const data = Array.from({ length: points }, (_, i) => ({
  x: i,
  y: Math.round(50 + 40 * Math.sin(i / 7)),
  g: i % 2 ? 'odd' : 'even',
}));
const h = React.createElement;
const Series = seriesType === 'line' ? LineSeries : BarSeries;
const render = () =>
  renderChartToSVGString(
    h(
      Chart,
      { id: 'mem', size: { width: 800, height: 400 } },
      h(Settings, { showLegend: true, legendPosition: Position.Bottom }),
      h(Axis, { id: 'x', position: Position.Bottom }),
      h(Axis, { id: 'y', position: Position.Left }),
      h(Series, {
        id: 's',
        xScaleType: ScaleType.Linear,
        xAccessor: 'x',
        yAccessors: ['y'],
        splitSeriesAccessors: ['g'],
        data,
      }),
      h(LineAnnotation, { id: 'limit', domainType: 'yDomain', dataValues: [{ dataValue: 80 }], marker: 'limit' }),
      h(RectAnnotation, { id: 'window', dataValues: [{ coordinates: { x0: 0, x1: points / 4 } }] }),
    ),
  );

const peakRssBefore = process.resourceUsage().maxRSS * 1024;

const t0 = performance.now();
const firstSvg = render();
const firstMs = performance.now() - t0;
const firstPeakRss = process.resourceUsage().maxRSS * 1024;
const afterFirst = snapshot();

let allocated = 0;
let svgBytes = 0;
const t1 = performance.now();
for (let i = 0; i < RUNS; i++) {
  globalThis.gc();
  const before = process.memoryUsage().heapUsed;
  svgBytes = render().length;
  allocated += process.memoryUsage().heapUsed - before;
}
const steadyMs = (performance.now() - t1) / RUNS;
const afterRuns = snapshot();

console.log(`${seriesType} chart, ${points} points, svg ${(firstSvg.length / 1024).toFixed(1)} KB`);
console.table({
  'node + modules loaded': {
    rss: fmt(loaded.rss),
    heap: fmt(loaded.heapUsed),
    'vs start': `+${fmt(loaded.rss - start.rss)} rss`,
  },
  'fonts registered': {
    rss: fmt(fontsLoaded.rss),
    heap: fmt(fontsLoaded.heapUsed),
    'vs start': `+${fmt(fontsLoaded.heapUsed + fontsLoaded.external - loaded.heapUsed - loaded.external)} heap+buffers`,
  },
  'after first render': {
    rss: fmt(afterFirst.rss),
    heap: fmt(afterFirst.heapUsed),
    'vs start': `+${fmt(afterFirst.heapUsed - fontsLoaded.heapUsed)} heap kept`,
  },
  [`after ${RUNS} more renders`]: {
    rss: fmt(afterRuns.rss),
    heap: fmt(afterRuns.heapUsed),
    'vs start': `+${fmt(afterRuns.heapUsed - afterFirst.heapUsed)} heap kept`,
  },
});
console.log(`peak rss of the process: ${fmt(Math.max(firstPeakRss, peakRssBefore))} at first render`);
console.log(`first render: ${firstMs.toFixed(0)} ms; warm render: ${steadyMs.toFixed(1)} ms`);
console.log(
  `garbage per warm render (heap growth before gc): ~${fmt(allocated / RUNS)}; svg ${(svgBytes / 1024).toFixed(1)} KB`,
);
