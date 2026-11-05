/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HeadlessRenderer } from './types';
import { isSimpleLinear, isWaffle } from '../chart_types/partition_chart/layout/viewmodel/viewmodel';
import { renderLinearPartitionCanvas2d } from '../chart_types/partition_chart/renderer/canvas/canvas_linear_renderers';
import { renderPartitionCanvas2d } from '../chart_types/partition_chart/renderer/canvas/canvas_renderers';
import { renderWrappedPartitionCanvas2d } from '../chart_types/partition_chart/renderer/canvas/canvas_wrapped_renderers';
import type { AnimationState } from '../chart_types/partition_chart/renderer/canvas/partition';
import {
  partitionDrilldownFocus,
  partitionMultiGeometries,
} from '../chart_types/partition_chart/state/selectors/geometries';
import { getChartContainerDimensionsSelector } from '../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../state/selectors/get_device_pixel_ratio';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';

/**
 * Draws pie, donut, sunburst, treemap, mosaic, waffle, icicle and flame charts with the canvas
 * renderers the `Partition` component uses. Nothing is highlighted and animations are off.
 * @internal
 */
export const renderPartitionChart: HeadlessRenderer = (ctx, state) => {
  const multiGeometries = partitionMultiGeometries(state);
  const foci = partitionDrilldownFocus(state);
  const { left, top } = getChartContainerDimensionsSelector(state);
  const { legendStrategy, flatLegend } = getSettingsSpecSelector(state);
  const { partition: partitionStyle } = getChartThemeSelector(state);
  const dpr = getDevicePixelRatioSelector(state);
  const animationState: AnimationState = { rafId: NaN };

  ctx.save();
  // In the DOM the canvas sits inside the chart container, which a left or top legend pushes aside.
  ctx.translate(left, top);
  multiGeometries.forEach((geometries, index) => {
    const focus = foci[index];
    if (!focus) return;
    if (isSimpleLinear(geometries.layout, geometries.style.fillLabel, geometries.layers)) {
      // Without an animation duration this draws once, synchronously.
      renderLinearPartitionCanvas2d(
        ctx,
        dpr,
        { ...geometries, animation: { duration: 0 } },
        focus,
        [],
        legendStrategy,
        flatLegend,
        partitionStyle,
        animationState,
      );
    } else if (isWaffle(geometries.layout)) {
      renderWrappedPartitionCanvas2d(ctx, dpr, geometries, [], legendStrategy, flatLegend, partitionStyle);
    } else {
      renderPartitionCanvas2d(ctx, dpr, geometries, [], legendStrategy, flatLegend, partitionStyle);
    }
  });
  ctx.restore();
};
