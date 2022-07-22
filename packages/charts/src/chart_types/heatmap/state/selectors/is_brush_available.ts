/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';

/**
 * The brush is available only if a onBrushEnd listener is configured
 * @internal
 */
export const isBrushAvailableSelector = createCustomCachedSelector(
  [getChartThemeSelector, getSettingsSpecSelector],
  ({ heatmap: { brushTool } }, { onBrushEnd }): boolean => Boolean(onBrushEnd) && brushTool.visible,
);

/** @internal */
export const isBrushEndProvided = createCustomCachedSelector([getSettingsSpecSelector], ({ onBrushEnd }): boolean =>
  Boolean(onBrushEnd),
);
