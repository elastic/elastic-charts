/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable no-console */

/**
 * Benchmarks of the package, in Node: it compiles the sources, then measures that build. From the root:
 *
 *   pnpm install && node packages/charts/scripts/bench [name] [--save=file] [--against=file]
 *
 *   name             only the charts with this in their name
 *   --save=file      also write the figures to a file
 *   --against=file   show each figure after the one of a file saved earlier, as on main: before -> now
 *
 * MEMORY, for gating. Bytes that the code of Charts alone decides, whatever the garbage collector does: they
 * repeat within about 1% and barely change with the version of Node.
 *   allocated    what a headless render allocates in the heap, so without the buffers of typed arrays; all
 *                of it is garbage once the render is over
 *   held         what the selectors of a rendered chart keep reachable while it exists: what lives through
 *                a whole render, which a collector ends up moving to its old generation, to free late and at
 *                a cost. With the last state of the chart, which they hold too: 2 to 5 kB of these figures
 *   left behind  what stays reachable after 3000 charts that differ, for each of them: a leak. It is near
 *                zero, within about 0.2 kB, unless something piles up: a ceiling to gate on, not to compare
 *
 * IN A SMALL HEAP, for context. The same renders in a process capped as on a small server. It is the
 * collector's doing as much as ours: it changes with the version of Node, CPU time by some 10% between runs.
 *   full collections   per 1000 renders; the costly ones, that free what was moved to the old generation
 *   CPU time           of a render, of the whole process: the collector's threads count
 *   roomy              time of a render with the default heap, to set against the CPU time
 *
 * INTERACTIVE, for context. A chart's store and, after each action, every selector of its chart type asked
 * about the new state, as its components ask. Nothing is painted. Medians.
 *   first          filling the store and computing everything once
 *   resize         a new width
 *   pointer move   the pointer at another position
 *   toggle series, pin tooltip   the dispatch alone: their reducers ask selectors themselves
 */

// as deployed: the development build of React allocates and takes more
process.env.NODE_ENV = 'production';

const { spawnSync } = require('child_process');
const fs = require('fs');
const inspector = require('inspector');
const path = require('path');
const { PerformanceObserver, constants, performance } = require('perf_hooks');
const v8 = require('v8');
const vm = require('vm');

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const packageRoot = path.resolve(__dirname, '../..');
if (!['--small-heap', '--left-behind'].includes(process.argv[2])) {
  // what is measured is the build of the sources as they are, never one left from another branch
  const build = spawnSync('pnpm', ['build:compile'], { cwd: packageRoot, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`The build failed\n${build.stdout}${build.stderr}`);
}
const dist = path.join(packageRoot, 'dist/cjs');
const use = (file) => require(path.join(dist, file));
const c = use('index.js');
const { renderChart } = use('headless/index.js');
const { HeadlessContext } = use('components/headless_context.js');
const { createChartStore } = use('state/chart_state.js');
const { updateParentDimensions } = use('state/actions/chart_settings.js');
const { specParsed, upsertSpecs } = use('state/actions/specs.js');
const { onPointerMove } = use('state/actions/mouse.js');
const { onToggleDeselectSeriesAction } = use('state/actions/legend.js');
const { pinTooltip } = use('state/actions/tooltip.js');
const { chartSelectorsRegistry, getInternalChartStateSelector } = use('state/selectors/get_internal_chart_state.js');
const { chartTypeSelectors } = use('chart_types/chart_type_selectors.js');
const { getLegendItemsSelector } = use('state/selectors/get_legend_items.js');
const { selectorMemos } = use('state/create_selector.js');

chartSelectorsRegistry.setChartSelectors(chartTypeSelectors);
const allCharts = require('./charts')(c, React);

/** the heap of the process that stands for a small server: megabytes of old generation, and of a semi-space */
const SMALL_HEAP = { old: 64, semi: 4 };
const SMALL_HEAP_RUNS = 3;
/** the same charts on every run, and enough of them for a slope that tells a leak of a few hundred bytes */
const LEFT_BEHIND_CHARTS = 3000;

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const milliseconds = (run) => {
  const start = process.hrtime.bigint();
  run();
  return Number(process.hrtime.bigint() - start) / 1e6;
};

// As a child process with a small heap: renders of one chart, and what they took
function smallHeapLoop(name, renders) {
  let full = 0;
  let from = Infinity;
  // the observer is told only once the renders are over: it leaves out the warm-up by the time of a collection
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const major = (entry.detail?.kind ?? entry.kind) === constants.NODE_PERFORMANCE_GC_MAJOR;
      if (major && entry.startTime >= from) full++;
    }
  }).observe({ entryTypes: ['gc'] });
  const warmUp = Math.floor(renders / 5);
  for (let i = 0; i < warmUp; i++) renderChart(allCharts[name]());
  from = performance.now();
  const cpuBefore = process.cpuUsage();
  for (let i = warmUp; i < renders; i++) renderChart(allCharts[name]());
  const cpu = process.cpuUsage(cpuBefore);
  const measured = renders - warmUp;
  // once the observer has been told of the last collections
  setTimeout(() => {
    const cpuMs = (cpu.user + cpu.system) / 1000 / measured;
    console.log(`RESULT ${JSON.stringify({ cpuMs, fullPer1000: (full * 1000) / measured })}`);
  }, 20);
}

/** Runs this file as a process of its own, in one of its child modes, and gives what it reports */
function inChild(flags, mode, name, renders) {
  const { stdout, stderr } = spawnSync(process.execPath, [...flags, __filename, mode, name, `${renders}`], {
    encoding: 'utf8',
  });
  const line = stdout.split('\n').find((text) => text.startsWith('RESULT '));
  if (!line) throw new Error(`No result of ${mode} for ${name}\n${stderr}`);
  return JSON.parse(line.slice(7));
}

function inSmallHeap(name, allocatedMB) {
  // as many renders as allocate 3 GB: enough collections to count, whatever the chart
  const renders = Math.max(60, Math.ceil(3072 / allocatedMB));
  const flags = [`--max-old-space-size=${SMALL_HEAP.old}`, `--max-semi-space-size=${SMALL_HEAP.semi}`];
  const runs = Array.from({ length: SMALL_HEAP_RUNS }, () => inChild(flags, '--small-heap', name, renders));
  return { cpuMs: runs.map((run) => run.cpuMs), fullPer1000: runs.map((run) => run.fullPer1000) };
}

v8.setFlagsFromString('--expose-gc');
const collect = vm.runInNewContext('gc');
/** bytes reachable, after full collections: those of the heap and of the buffers of typed arrays, which are outside it */
const live = () => {
  collect();
  collect();
  const { heapUsed, arrayBuffers } = process.memoryUsage();
  return heapUsed + arrayBuffers;
};

const session = new inspector.Session();
session.connect();
const post = (method, params) =>
  new Promise((resolve, reject) => {
    session.post(method, params, (error, result) => (error ? reject(error) : resolve(result)));
  });

/** Megabytes a headless render allocates, collected or not, from the sampling heap profiler */
async function allocated(make) {
  for (let i = 0; i < 30; i++) renderChart(make());
  const n = 100;
  await post('HeapProfiler.startSampling', {
    samplingInterval: 1024,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
  for (let i = 0; i < n; i++) renderChart(make());
  const { profile } = await post('HeapProfiler.stopSampling');
  let bytes = 0;
  (function add(node) {
    bytes += node.selfSize;
    node.children.forEach(add);
  })(profile.head);
  return bytes / n / 2 ** 20;
}

/** A chart as it is while it exists, without its components: its store, and its selectors to ask */
function liveChart(id, make) {
  const specs = new Map();
  const collecting = { charts: 0, collect: (spec) => specs.set(spec.id, spec) };
  renderToStaticMarkup(React.createElement(HeadlessContext.Provider, { value: collecting }, make()));
  const store = createChartStore(id);
  const ask = () => {
    const state = store.getState();
    const selectors = getInternalChartStateSelector(state);
    for (const key of Object.keys(selectors)) {
      if (typeof selectors[key] !== 'function' || key === 'eventCallbacks' || key === 'getDebugState') continue;
      selectors[key](state);
    }
    return getLegendItemsSelector(state);
  };
  const size = (width) => store.dispatch(updateParentDimensions({ width, height: 400, top: 0, left: 0 }));
  const fill = () => {
    store.dispatch(upsertSpecs([...specs.values()]));
    store.dispatch(specParsed());
    size(800);
    ask();
  };
  // as a chart does when it is gone: what its selectors computed stays reachable until then
  const release = () => {
    selectorMemos.release(store.getState().uniqueChartKey);
  };
  return { store, ask, size, fill, release };
}

/**
 * Kilobytes that a chart keeps reachable while it exists: headless renders, for all that a chart computes,
 * whose release of what their selectors computed waits until it is measured
 */
function held(make) {
  const n = 30;
  const keys = [];
  selectorMemos.release = (key) => keys.push(key);
  for (let i = 0; i < n; i++) renderChart(make());
  delete selectorMemos.release;
  // what the release frees: nothing else that the renders may have left counts
  const before = live();
  keys.forEach((key) => selectorMemos.release(key));
  const bytes = (before - live()) / n;
  return keys.length === n ? bytes / 1024 : NaN;
}

// As a child process, so that nothing else it ran is there to be freed: renders of charts that differ, and
// how what stays reachable grows over their second half, as the slope through six readings
function leftBehindLoop(name, renders) {
  const from = Math.floor(renders / 2);
  const step = Math.floor((renders - from) / 6);
  const readings = [];
  for (let i = 1; i <= renders; i++) {
    renderChart(allCharts[name](i));
    if (i >= from && (i - from) % step === 0 && readings.length < 7) readings.push([i, live()]);
  }
  // not the first: the engine drops compiled code it no longer needs a collection or two after it
  readings.shift();
  const mean = (at) => readings.reduce((sum, reading) => sum + reading[at], 0) / readings.length;
  const [x, y] = [mean(0), mean(1)];
  const slope =
    readings.reduce((sum, [i, bytes]) => sum + (i - x) * (bytes - y), 0) /
    readings.reduce((sum, [i]) => sum + (i - x) ** 2, 0);
  console.log(`RESULT ${JSON.stringify({ leftKB: slope / 1024 })}`);
}

/** Kilobytes still reachable after many charts that differ, for each of them */
const leftBehind = (name) => inChild([], '--left-behind', name, LEFT_BEHIND_CHARTS).leftKB;

/** The chart with an action for its tooltip: one that can be pinned */
const withTooltipAction = (chart) => {
  const tooltip = React.createElement(c.Tooltip, { actions: [{ label: () => 'an action', onSelect: () => {} }] });
  return React.cloneElement(chart, undefined, ...React.Children.toArray(chart.props.children), tooltip);
};

function interactive(name, make) {
  const { store, ask, size, fill, release } = liveChart(`interactive ${name}`, () => withTooltipAction(make()));
  const timed = (act) =>
    milliseconds(() => {
      act();
      ask();
    });
  const move = (i) =>
    store.dispatch(onPointerMove({ position: { x: 100 + ((i * 3) % 500), y: 100 + ((i * 7) % 200) }, time: i }));

  const firstMs = milliseconds(fill);
  for (let i = 0; i < 300; i++) timed(() => move(i));
  const moves = Array.from({ length: 2000 }, (_, i) => timed(() => move(i)));
  const resizes = Array.from({ length: 9 }, (_, i) => timed(() => size(807 + i * 7)));

  // those that a click on the legend toggles: none of a sunburst
  const items = ask().filter((item) => item.isToggleable);
  const toggles = items.length === 0 ? [NaN] : [];
  for (let i = 0; i < 20 && items.length > 0; i++) {
    const legendItemIds = items[i % items.length].seriesIdentifiers;
    toggles.push(milliseconds(() => store.dispatch(onToggleDeselectSeriesAction({ legendItemIds, metaKey: false }))));
    ask();
  }
  const pins = [];
  for (let i = 0; i < 20; i++) {
    timed(() => move(i * 11));
    const pinMs = milliseconds(() => store.dispatch(pinTooltip({ pinned: true })));
    // only where there was a tooltip to pin
    if (store.getState().interactions.tooltip.pinned) pins.push(pinMs);
    timed(() => store.dispatch(pinTooltip({ pinned: false, resetPointer: true })));
  }
  if (pins.length === 0) pins.push(NaN);
  release();
  return {
    firstMs,
    resizeMs: median(resizes),
    moveUs: median(moves) * 1000,
    toggleUs: median(toggles) * 1000,
    pinUs: median(pins) * 1000,
  };
}

async function measure(name, make) {
  const allocatedMB = await allocated(make);
  const renderMs = median(Array.from({ length: 50 }, () => milliseconds(() => renderChart(make()))));
  const heldKB = held(make);
  const leftKB = leftBehind(name);
  const smallHeap = inSmallHeap(name, allocatedMB);
  return { allocatedMB, heldKB, leftKB, renderMs, smallHeap, ...interactive(name, make) };
}

/** Prints rows of figures under their headings, the columns as wide as they need to be */
function table(title, columns, rows) {
  const lines = [
    ['', ...Object.keys(columns)],
    ...rows.map(([name, r]) => [name, ...Object.values(columns).map((text) => text(name, r))]),
  ];
  const widths = lines[0].map((_, i) => Math.max(...lines.map((line) => line[i].length)));
  console.log(`\n${title}`);
  for (const line of lines) {
    console.log(line.map((text, i) => (i === 0 ? text.padEnd(widths[i]) : text.padStart(widths[i] + 3))).join(''));
  }
}

function report(results, before, file) {
  // a figure, after the one of the file compared against where there is one; the bytes are steady enough for a percent
  const figure = (pick, digits, unit, percent) => (name, r) => {
    const [was, now] = [before?.[name] && pick(before[name]), pick(r)];
    // a figure that was not a number, as of a chart with nothing to toggle, is saved as null
    if (typeof was !== 'number') return `${now.toFixed(digits)}${unit}`;
    const change = `${now >= was ? '+' : ''}${(((now - was) / was) * 100).toFixed(0)}%`.padStart(6);
    return `${was.toFixed(digits)} -> ${now.toFixed(digits)}${unit}${percent ? change : ''}`;
  };
  const ofRuns = (pick, digits, unit) => (name, r) => {
    const [least, most] = [Math.min(...pick(r)), Math.max(...pick(r))].map((value) => value.toFixed(digits));
    return `${figure((of) => median(pick(of)), digits, unit)(name, r)} (${least} to ${most})`;
  };
  const rows = Object.entries(results);

  console.log(`Node ${process.version}, ${process.platform} ${process.arch}`);
  if (before) console.log(`Each figure after the one of ${file}`);
  table(
    'MEMORY, for gating',
    {
      allocated: figure((of) => of.allocatedMB, 2, ' MB', true),
      held: figure((of) => of.heldKB, 0, ' kB', true),
      'left behind': figure((of) => of.leftKB, 1, ' kB'),
    },
    rows,
  );
  table(
    `IN A SMALL HEAP of ${SMALL_HEAP.old} MB, for context: median of ${SMALL_HEAP_RUNS} runs (least to most)`,
    {
      'full collections / 1000': ofRuns((of) => of.smallHeap.fullPer1000, 0, ''),
      'CPU time': ofRuns((of) => of.smallHeap.cpuMs, 2, ' ms'),
      roomy: figure((of) => of.renderMs, 2, ' ms'),
    },
    rows,
  );
  table(
    'INTERACTIVE, for context',
    {
      first: figure((of) => of.firstMs, 1, ' ms'),
      resize: figure((of) => of.resizeMs, 2, ' ms'),
      'pointer move': figure((of) => of.moveUs, 1, ' us'),
      'toggle series': figure((of) => of.toggleUs, 0, ' us'),
      'pin tooltip': figure((of) => of.pinUs, 0, ' us'),
    },
    rows,
  );
}

async function main() {
  const options = process.argv.slice(2);
  const option = (name) => options.find((text) => text.startsWith(`--${name}=`))?.slice(name.length + 3);
  const only = options.find((text) => !text.startsWith('--'));
  await post('HeapProfiler.enable');
  const results = {};
  const charts = Object.entries(allCharts).filter(([name]) => !only || name.includes(only));
  if (charts.length === 0) throw new Error(`No chart has "${only}" in its name`);
  for (const [name, make] of charts) results[name] = await measure(name, make);
  const against = option('against');
  report(results, against ? JSON.parse(fs.readFileSync(against, 'utf8')) : undefined, against);
  const save = option('save');
  if (save) {
    fs.mkdirSync(path.dirname(path.resolve(save)), { recursive: true });
    fs.writeFileSync(save, `${JSON.stringify(results, null, 2)}\n`);
  }
}

if (process.argv[2] === '--small-heap') {
  smallHeapLoop(process.argv[3], Number(process.argv[4]));
} else if (process.argv[2] === '--left-behind') {
  leftBehindLoop(process.argv[3], Number(process.argv[4]));
} else {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

/* eslint-enable no-console */
