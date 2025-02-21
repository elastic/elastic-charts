/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BrushAxis } from './brush_axis';
import { DEFAULT_LEGEND_CONFIG } from './default_legend_config';
import { PointerUpdateTrigger } from './pointer_update_trigger';
import { SettingsSpec } from './settings';
import { SpecType } from './spec_type';
import { ChartType } from '../chart_types';
import { buildSFProps } from '../state/spec_factory';
import { LIGHT_THEME } from '../utils/themes/light_theme';

/** @public */
export const settingsBuildProps = buildSFProps<SettingsSpec>()(
  {
    id: '__global__settings___' as const,
    chartType: ChartType.Global,
    specType: SpecType.Settings,
  },
  {
    rendering: 'canvas' as const,
    rotation: 0 as const,
    animateData: true,
    debug: false,
    pointerUpdateTrigger: PointerUpdateTrigger.X,
    externalPointerEvents: {
      tooltip: {
        visible: false,
      },
    },
    baseTheme: LIGHT_THEME,
    brushAxis: BrushAxis.X,
    minBrushDelta: 2,
    ariaUseDefaultSummary: true,
    ariaLabelHeadingLevel: 'p',
    allowBrushingLastHistogramBin: true,
    pointBuffer: 10,
    ...DEFAULT_LEGEND_CONFIG,
    locale: 'en-US',
    dow: 1,
  },
);

/** @public */
export const DEFAULT_SETTINGS_SPEC: SettingsSpec = {
  ...settingsBuildProps.defaults,
  ...settingsBuildProps.overrides,
};
