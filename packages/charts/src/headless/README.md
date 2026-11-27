# Charts headless without React

A proof of concept on the branch `react-less`. In Node, `@elastic/charts/headless` renders a chart to the same HTML
and SVG string as before, but loads nothing of React, no redux and far fewer files. It is not released and the API may
still change.

## How to use it

1. **Build a package from the branch.** Node 22 or later.

   ```bash
   git checkout react-less
   yarn install
   yarn --cwd packages/charts build
   cd packages/charts && npm pack        # writes elastic-charts-73.5.1.tgz
   ```

2. **Install the tarball in your project.**

   ```json
   "dependencies": {
     "@elastic/charts": "file:./elastic-charts-73.5.1.tgz",
     "moment-timezone": "^0.5.32"
   }
   ```

   Yarn 1 caches a `file:` tarball by name and version. After repacking, run `yarn cache clean @elastic/charts`
   before installing again. `react` and `react-dom` are still declared peers, so the install warns that they are
   missing. A project that only renders headless in Node can ignore that: neither is loaded.

3. **Import everything from the headless entry.** This is the one code change: the chart components come from
   `@elastic/charts/headless` too, not from `@elastic/charts`, and so does `createElement`, which makes the
   elements of the chart. Nothing is imported from `react`.

   ```js
   import {
     createElement as h,
     Chart,
     Settings,
     Axis,
     BarSeries,
     Position,
     ScaleType,
     renderChart,
   } from '@elastic/charts/headless';

   const html = renderChart(
     h(
       Chart,
       { size: { width: 600, height: 300 } },
       h(Settings, { showLegend: true }),
       h(Axis, { id: 'x', position: Position.Bottom }),
       h(Axis, { id: 'y', position: Position.Left }),
       h(BarSeries, { id: 'bars', xScaleType: ScaleType.Ordinal, xAccessor: 'x', yAccessors: ['y'], data }),
     ),
   );
   ```

   For JSX, point the classic JSX transform at that function with `/** @jsx createElement */` at the top of the
   file, or with the `jsxFactory` setting of your compiler. The stylesheet is used as before
   (`@elastic/charts/theme_only_light.css`); see `docs/docs/docs/headless.mdx`.

   An element is a plain object, `{ type, props }`, and `createElement` only puts one together. So a chart can
   also be described as data of your own and turned into elements in a few lines.

4. **Nothing to switch on.** Node picks the new build by itself, through the `node` condition of the package
   exports. To confirm:

   ```bash
   node -p "require.resolve('@elastic/charts/headless')"
   # …/@elastic/charts/dist/node/cjs/headless/index.js
   ```

   If you bundle your server code, the bundler has to resolve with the `node` condition (esbuild
   `--platform=node`, webpack `target: 'node'`) or leave `@elastic/charts` external. Otherwise it picks the build
   for browsers, which still works but renders with React and saves nothing.

## What to watch for

- **Components from the main entry are refused.** A chart built from `@elastic/charts` components throws
  `renderChart expects a <Chart> element, of the Chart that @elastic/charts/headless exports`. In Node the headless
  entry is its own copy of Charts.
- **No hooks in components you pass in.** A custom legend or similar is called once as a plain function. One that
  calls `useState` or another hook throws `Cannot read properties of null`.
- **Unchanged from the released version:** pass a `<Chart>` directly, with a numeric width and height; word cloud,
  flame and timeslip charts are not supported; text is measured with Inter's widths.

## What was removed

From what a headless render loads in Node:

| No longer loaded                                       | What does the job now                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `react`, `react-dom`, `react-dom/server`, `scheduler`  | A stand-in of about 300 lines that walks the elements once and writes markup |
| `react-redux`, `use-sync-external-store`               | Part of the same stand-in: a component reads the store when it renders       |
| `@reduxjs/toolkit`, `redux`, `redux-thunk`, `reselect` | A small store on immer, which stays                                          |
| `@popperjs/core`                                       | Nothing: it placed tooltips, which a headless render never shows             |
| `uuid`                                                 | A counted ID. Gone from the package for browsers too                         |
| `luxon`                                                | About 100 lines on `Intl.DateTimeFormat`. Gone from the package for browsers too |
| About 630 separate module files                        | One file for the headless entry                                              |

Still loaded: the d3 packages, chroma-js, moment-timezone (time axes need it), immer and four small utilities.

The packed tarball grows from about 1 MB to 2.1 MB, because it carries the builds for Node next to the ones for
bundlers.

## Measured effect

One fresh Node process that loads the entry and renders the same chart 700 times (40 bars, two axes, a legend,
600 × 300). Median of 9 runs, macOS on Apple silicon, Node 26, CommonJS.

| Measure                           | `main` (ac540e6a25) | This branch |
| --------------------------------- | ------------------: | ----------: |
| Heap added by loading             |             14.9 MB |      3.8 MB |
| Resident memory added by loading  |             44.1 MB |     22.5 MB |
| Live heap after 700 renders       |             22.8 MB |     10.9 MB |
| Resident memory after 700 renders |              209 MB |      180 MB |
| Peak resident memory              |              236 MB |      206 MB |
| Files loaded                      |                 659 |          26 |
| Load time                         |        about 180 ms | about 40 ms |
| Time for one render               |             0.44 ms |     0.38 ms |

The markup is byte for byte the same. The load times were taken on a busy machine, so read them as a ratio. The
last three rows of memory are mostly garbage that V8 has not collected yet, which is why they move less than the
first three.

**The bigger lever for peak memory is a cap on the V8 heap.** With
`node --max-old-space-size=96 --max-semi-space-size=4` the same run on this branch peaks at 132 MB and settles at
99 MB, for a few percent more time per render. A `Worker` with `resourceLimits` does the same for the rendering
thread alone. The cap does not depend on this branch: it works on the released version too, where the same kind of
run went from about 310 MB to about 140 MB.

## What could come next

A form of the chart that is all data, such as JSON, if Charts should own that vocabulary. Today it is a few lines
on top of `createElement` on your side.
