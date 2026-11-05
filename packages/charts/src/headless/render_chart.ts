/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderLegend } from './legend';
import { renderBulletChart } from './render_bullet';
import { renderGoalChart } from './render_goal';
import { renderHeatmapChart } from './render_heatmap';
import { renderMetricChart } from './render_metric';
import { renderPartitionChart } from './render_partition';
import { renderWordcloudChart } from './render_wordcloud';
import { renderXYChart } from './render_xy';
import type { HeadlessRenderer } from './types';
import { ChartType } from '../chart_types';
import { chartTypeSelectors } from '../chart_types/chart_type_selectors';
import { withPath2D } from '../renderers/canvas/path2d';
import type { Spec } from '../specs/spec_type';
import { updateDevicePixelRatio, updateParentDimensions } from '../state/actions/chart_settings';
import { specParsed, upsertSpec } from '../state/actions/specs';
import { createChartStore } from '../state/chart_state';
import { chartSelectorsRegistry } from '../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { withTextMeasureContext } from '../utils/bbox/canvas_text_bbox_calculator';

/**
 * Options for {@link renderChart}.
 * @public
 */
export interface RenderChartOptions {
  /** The chart's specs, as returned by `collectSpecs`. */
  specs: Spec[];
  /** Chart width in CSS pixels. */
  width: number;
  /** Chart height in CSS pixels. */
  height: number;
  /**
   * Where the chart is drawn: a browser canvas, a Node canvas library, or `SvgCanvas.context`.
   * It also measures the text the layout depends on.
   */
  context: CanvasRenderingContext2D;
  /** The Path2D implementation `context` accepts. Defaults to the global `Path2D`. */
  Path2D?: typeof Path2D;
  /** Pixel density of `context`. Defaults to 1. */
  devicePixelRatio?: number;
}

const HEADLESS_RENDERERS: Partial<Record<ChartType, HeadlessRenderer>> = {
  [ChartType.XYAxis]: renderXYChart,
  [ChartType.Partition]: renderPartitionChart,
  [ChartType.Heatmap]: renderHeatmapChart,
  [ChartType.Goal]: renderGoalChart,
  [ChartType.Bullet]: renderBulletChart,
  [ChartType.Metric]: renderMetricChart,
  [ChartType.Wordcloud]: renderWordcloudChart,
};

/**
 * Lays out and draws a chart onto `context` without React, a DOM or a browser, e.g. on a server.
 * Supports XY charts. The legend is drawn as a plain list; tooltips and interactions do not apply.
 * @public
 */
export function renderChart({
  specs,
  width,
  height,
  context,
  Path2D: Path2DConstructor = globalThis.Path2D,
  devicePixelRatio = 1,
}: RenderChartOptions): void {
  // What <Chart> does when it is created.
  chartSelectorsRegistry.setChartSelectors(chartTypeSelectors);
  const store = createChartStore('headless');

  withTextMeasureContext(context, () =>
    withPath2D(Path2DConstructor, () => {
      // What the spec components, <SpecsParser> and <ChartResizer> do once mounted.
      specs.forEach((spec) => store.dispatch(upsertSpec(spec)));
      store.dispatch(specParsed());
      store.dispatch(updateParentDimensions({ width, height, top: 0, left: 0 }));
      store.dispatch(updateDevicePixelRatio(devicePixelRatio));

      const state = store.getState();
      const status = getInternalIsInitializedSelector(state);
      if (status !== InitStatus.Initialized) {
        throw new Error(`The chart cannot be rendered: ${status}`);
      }
      const render = state.chartType ? HEADLESS_RENDERERS[state.chartType] : undefined;
      if (!render) {
        throw new Error(`Headless rendering does not support the "${state.chartType}" chart type yet`);
      }
      render(context, state);
      renderLegend(context, state);
    }),
  );
}
