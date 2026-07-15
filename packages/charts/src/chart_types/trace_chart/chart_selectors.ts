/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createChartSelectorsFactory } from '../../state/chart_selectors';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getSpecsFromStore } from '../../state/utils/get_specs_from_store';
import { ChartType } from '..';
import { SpecType } from '../../specs/spec_type';
import type { TraceSpec } from './trace_api';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  getChartTypeDescription: () => 'Trace chart',
  isInitialized: () => InitStatus.Initialized,
  isChartEmpty: (globalState): boolean => {
    const spec = getSpecsFromStore<TraceSpec>(globalState.specs, ChartType.Trace, SpecType.Series)[0];
    if (!spec || spec.data.length === 0) return true;
    // Mirrors the traceId filter in normalize() without re-emitting dev-warnings
    // (the RAF pipeline already emits them when it runs).
    if (spec.traceId != null) return !spec.data.some((d) => d.traceId === spec.traceId);
    return false;
  },
  getTooltipAnchor: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  getTooltipInfo: () => ({ header: null, values: [] }),
  // Trace hover is not in redux — the real over-span cursor is applied inline on the canvas element
  // via `getActiveCursor()` in trace_chart.tsx. This selector only reflects the container-level
  // default and equals the factory default; it is included to satisfy the ChartSelectors seam.
  getPointerCursor: () => DEFAULT_CSS_CURSOR,
});
