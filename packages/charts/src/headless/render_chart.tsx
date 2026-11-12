/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';

/**
 * Renders a chart to markup without a DOM: one root element holding the chart drawn as an inline
 * `<svg>` and, as HTML, its legend or its metric panels. Style it with the Charts stylesheet.
 *
 * The element is a `Chart` with a `size` in pixels, or a tree that renders exactly one.
 * @public
 */
export function renderChart(chart: ReactElement): string {
  throw new Error(`renderChart is not implemented yet (${typeof chart})`);
}
