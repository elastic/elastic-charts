/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// The main entry, and nothing else of the chart: the built headless entry imports the main entry's file, so
// that the two share one `Chart`. See `mainEntryOnly` in rslib.config.mts.
import type { ChartProps } from '..';
import { Chart } from '..';

/**
 * Renders a chart to markup without a DOM: one root element holding the chart drawn as an inline
 * `<svg>` and, as HTML, its legend or its metric panels. Style it with the Charts stylesheet.
 *
 * The element must be a `Chart` with positive numeric width and height in pixels, and its title and description
 * are omitted. Take every chart component from this entry too, in the same module format: in Node it is a copy of
 * Charts of its own, which renders without React and so runs no hook of a component passed to it.
 * Word cloud, flame and timeslip charts are not supported: they draw on a canvas of their own.
 *
 * Where there is no DOM, text is measured with Inter's advance widths, whatever the font of the theme, so
 * layout that depends on text width is close to a browser's but not identical.
 * @public
 */
export function renderChart(chart: ReactElement): string {
  if (!React.isValidElement<ChartProps>(chart) || chart.type !== Chart) {
    throw new Error('renderChart expects a <Chart> element, of the Chart that @elastic/charts/headless exports');
  }
  return Chart.renderHeadless(chart, renderToStaticMarkup);
}
