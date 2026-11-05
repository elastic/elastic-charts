/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { HeadlessRenderer } from './types';
import { renderBullet } from '../chart_types/bullet_graph/renderer/canvas/bullet';
import { getActiveValues } from '../chart_types/bullet_graph/selectors/get_active_values';
import { getBulletSpec } from '../chart_types/bullet_graph/selectors/get_bullet_spec';
import { getPanelDimensions } from '../chart_types/bullet_graph/selectors/get_panel_dimensions';
import { getA11ySettingsSelector } from '../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../state/selectors/get_device_pixel_ratio';
import { getResolvedBackgroundColorSelector } from '../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';

/**
 * Draws Bullet graphs with the same canvas code and props as `BulletRenderer`. Elastic Charts draws a
 * panel as a DOM metric instead when it is at most 140px wide (128px for arcs) or at most the header
 * (up to ~92px) plus the graph's minimum height (50px horizontal, 100px vertical, up to 128px for
 * arcs) tall; such panels are left blank here.
 * @internal
 */
export const renderBulletChart: HeadlessRenderer = (ctx, state) => {
  renderBullet(ctx, getDevicePixelRatioSelector(state), {
    debug: getSettingsSpecSelector(state).debug,
    spec: getBulletSpec(state),
    a11y: getA11ySettingsSelector(state),
    dimensions: getPanelDimensions(state),
    activeValues: getActiveValues(state),
    style: getChartThemeSelector(state).bulletGraph,
    backgroundColor: getResolvedBackgroundColorSelector(state),
  });
};
