/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HeadlessRenderer } from './types';
import { renderCanvas2d } from '../chart_types/goal_chart/renderer/canvas/canvas_renderers';
import { getPrimitiveGeoms } from '../chart_types/goal_chart/state/selectors/geometries';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../state/selectors/get_device_pixel_ratio';

/**
 * Draws Goal charts with the same canvas code and props as the `Goal` component.
 * @internal
 */
export const renderGoalChart: HeadlessRenderer = (ctx, state) => {
  const { width, height } = state.parentDimensions;
  if (width === 0 || height === 0) return;
  renderCanvas2d(
    ctx,
    getDevicePixelRatioSelector(state),
    getPrimitiveGeoms(state),
    getChartThemeSelector(state).background.color,
  );
};
