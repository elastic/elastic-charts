/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HeadlessRenderer } from './types';
import { renderHeatmapCanvas2d } from '../chart_types/heatmap/renderer/canvas/canvas_renderers';
import type { ReactiveChartStateProps } from '../chart_types/heatmap/renderer/canvas/connected_component';
import { computeChartDimensionsSelector } from '../chart_types/heatmap/state/selectors/compute_chart_dimensions';
import { computeChartElementSizesSelector } from '../chart_types/heatmap/state/selectors/compute_chart_element_sizes';
import { getHeatmapContainerSizeSelector } from '../chart_types/heatmap/state/selectors/get_heatmap_container_size';
import { getPerPanelHeatmapGeometries } from '../chart_types/heatmap/state/selectors/get_per_panel_heatmap_geometries';
import type { GlobalChartState } from '../state/chart_state';
import { getA11ySettingsSelector } from '../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getLegendConfigSelector } from '../state/selectors/get_legend_config_selector';
import { getLegendSizeSelector } from '../state/selectors/get_legend_size';
import { LayoutDirection, Position } from '../utils/common';

// What the connected Heatmap component maps from the state, without interactions.
const getHeatmapRendererProps = (state: GlobalChartState): ReactiveChartStateProps => {
  const theme = getChartThemeSelector(state);
  return {
    initialized: true,
    geometries: getPerPanelHeatmapGeometries(state),
    chartContainerDimensions: getHeatmapContainerSizeSelector(state),
    highlightedLegendBands: [],
    theme,
    a11ySettings: getA11ySettingsSelector(state),
    background: theme.background.color,
    elementSizes: computeChartElementSizesSelector(state),
    debug: false,
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    devicePixelRatio: 1,
  };
};

// In the DOM the heatmap canvas follows the legend, so a left or top legend pushes it aside.
const getContainerOffset = (state: GlobalChartState) => {
  const { showLegend, legendPosition } = getLegendConfigSelector(state);
  if (!showLegend || legendPosition.floating) return { x: 0, y: 0 };
  const { width, height, margin } = getLegendSizeSelector(state);
  if (legendPosition.direction === LayoutDirection.Vertical) {
    return { x: legendPosition.hAlign === Position.Left ? width + margin * 2 : 0, y: 0 };
  }
  const { maxLegendHeight } = getChartThemeSelector(state).heatmap;
  return { x: 0, y: legendPosition.vAlign === Position.Top ? maxLegendHeight ?? height + margin * 2 : 0 };
};

/** @internal */
export const renderHeatmapChart: HeadlessRenderer = (ctx, state) => {
  const props = getHeatmapRendererProps(state);
  if (props.geometries.heatmapViewModels.length === 0) return;
  const { x, y } = getContainerOffset(state);
  ctx.save();
  ctx.translate(x, y);
  renderHeatmapCanvas2d(ctx, 1, props);
  ctx.restore();
};
